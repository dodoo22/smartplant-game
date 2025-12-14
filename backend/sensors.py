import os
import random
import time
import RPi.GPIO as GPIO
try:
    import smbus2
except ImportError:
    smbus2 = None


_soil_virtual = 55.0
_last_t = time.time()

BH1750_ADDRS = [0x23, 0x5C]  # 常見位址：ADDR 腳對 GND → 0x23；對 VCC → 0x5C
CMD_POWER_ON = 0x01          # 開電源（有些模組上電後需顯式 POWER ON）
CMD_CONT_HRES = 0x10         # 連續高解析度模式（約 0.12~0.24s）

# 可設定的腳位（BCM 編號）
DHT_PIN = int(os.getenv("DHT_PIN", "4"))
SOIL_PIN = int(os.getenv("SOIL_PIN", "17"))


bus = None
if smbus2 is not None:
    try:
        bus = smbus2.SMBus(1)
    except FileNotFoundError:
        print("⚠ WARNING: /dev/i2c-1 not found, BH1750 disabled for now.")
        bus = None



# ===== 腳位設定 =====
TOUCH_PIN = 6  # 你 TTP223 / 電容觸控模組 OUT 接的那一腳（之前 test_touch 用的那個）

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(TOUCH_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(SOIL_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)


def _read_touch() -> bool:
    """
    讀取電容式觸控模組狀態。
    如果你在 test_touch.py 測到：
      - 碰葉子時 GPIO.input(6) == 1 → 就用 v == 1
      - 如果相反，就改成 v == 0
    """
    v = GPIO.input(TOUCH_PIN)
    return v == 1   # 如果你發現邏輯相反，就改成：return v == 0

def read_bh1750():
    """讀取 BH1750 亮度（lux）。
    - 會嘗試兩個常見位址 0x23 / 0x5C。
    - 失敗時回傳 0.0，並印出可診斷的訊息。
    """
    if bus is None:
        # I2C 還沒開 / 感測器還沒接好 → 先回 0，不要讓程式死掉
        return 0.0

    last_error = None
    for addr in BH1750_ADDRS:
        try:
            readings = []
            # 顯式 POWER ON
            bus.write_byte(addr, CMD_POWER_ON)
            time.sleep(0.01)
            # 連續高解析度模式
            bus.write_byte(addr, CMD_CONT_HRES)
            # 連續讀取 3 次取平均，提升穩定度
            for _ in range(3):
                time.sleep(0.22)
                data = bus.read_i2c_block_data(addr, 0x00, 2)
                raw = (data[0] << 8) | data[1]
                readings.append(raw)
            # 過濾全零讀值，避免立即回 0
            valid = [r for r in readings if r > 0]
            if not valid:
                last_error = ValueError(f"BH1750 addr=0x{addr:02X} returned only zeros: {readings}")
                continue
            avg_raw = sum(valid) / len(valid)
            lux = avg_raw / 1.2
            return lux
        except Exception as e:
            last_error = e
            continue

    if last_error is not None:
        print("BH1750 read error:", last_error)
        print("👉 提示：請用 'i2cdetect -y 1' 確認位址是否為 0x23 或 0x5C；檢查 I2C 是否啟用、接線與 3.3V 供電。")
    return 0.0

def _read_dht22():
    """
    讀取 DHT22 的溫度與濕度。
    函式可能會丟 RuntimeError（感測器沒回應），所以要 try/except。
    回傳 (humi, temp) 單位：(% , °C)，讀失敗回 (None, None)。
    """
    # 先嘗試 adafruit_circuitpython_dht（CircuitPython 驅動）
    try:
        import board
        import adafruit_dht
        board_pin = getattr(board, f"D{DHT_PIN}", None)
        if board_pin is not None:
            d = adafruit_dht.DHT22(board_pin, use_pulseio=False)
            try:
                # 多次嘗試取得讀值（DHT 容易有 transient error）
                for _ in range(5):
                    try:
                        t = d.temperature
                        h = d.humidity
                        if t is not None and h is not None:
                            return (round(h, 1), round(t, 1))
                    except RuntimeError:
                        time.sleep(1.0)
                        continue
                return (None, None)
            finally:
                try:
                    d.exit()
                except Exception:
                    pass
    except Exception:
        # adafruit_dht 不可用或失敗，繼續嘗試 Adafruit_DHT
        pass

    # 再嘗試傳統的 Adafruit_DHT
    try:
        import Adafruit_DHT
        h, t = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, DHT_PIN)
        if h is None or t is None:
            return (None, None)
        return (round(h, 1), round(t, 1))
    except Exception:
        return (None, None)

def _read_soil_digital() -> bool:
    v = GPIO.input(SOIL_PIN)
    return v == 1   # 如果你測到「乾的時候 DO=1」，就改成 return v == 0

"""
def _virtual_soil_pct(is_wet: bool) -> float:
    
    用 DO(乾/濕) 產生看起來像真的 0~100%。
    - 平常會隨時間慢慢下降（代表土慢慢變乾）
    - 只要判定為濕（DO=1）就把%往上拉
    
    global _soil_virtual, _last_t
    now = time.time()
    dt = now - _last_t
    _last_t = now

    # 每秒下降 0.02%（你可以調快/調慢）
    _soil_virtual = max(0.0, _soil_virtual - dt * 0.02)

    # 如果目前判定「濕」，就加回去（每次 status 會被呼叫）
    if is_wet:
        _soil_virtual = min(100.0, _soil_virtual + 2.5)

    return round(_soil_virtual, 1)

"""


def read_all_sensors(mock: bool = False):
    """
    給 app.py 用的主函式。

    mock=True  → 回傳隨機假資料（開發 / 沒插硬體用）
    mock=False → 讀取真實感測器（目前只接觸控，其它先用固定值）
    """
    if mock:
        # ⭐ 保留你原本的亂數版本
        return {
            "soil_pct": 35 + 15 * random.random(),
            "lux": 500 + 5000 * random.random(),
            "temp_c": 24 + 4 * random.random(),
            "humi_pct": 50 + 10 * random.random(),
            "touch": random.random() < 0.1,
        }

    # ⭐ 這裡開始是真實硬體版（目前只有觸控是真的，其它先給固定值）
    touch = _read_touch()
    lux = read_bh1750()
    humi_pct, temp_c = _read_dht22()
    soil_pct = _read_soil_digital()
    #soil_pct = _virtual_soil_pct(is_wet)


    # TODO：之後你再把下面這幾個改成 BH1750 / BME280 / 土壤感測器的真實讀值
    return {
        "soil_pct": soil_pct,
        "lux": lux,
        "temp_c": temp_c,
        "humi_pct": humi_pct,
        "touch": touch,
    }
