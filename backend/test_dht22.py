#!/usr/bin/env python3
"""DHT22 測試腳本

用法：
  python test_dht22.py [--pin BCM_PIN]

預設會用 BCM pin 4（對應板上 GPIO4，常見接法）。

此腳本會依序嘗試：
 1) adafruit_circuitpython_dht (`adafruit_dht`) + `board` （CircuitPython 驅動）
 2) Adafruit_Python_DHT (`Adafruit_DHT`) 的 read_retry

若兩者皆未安裝，腳本會顯示安裝指令。

注意：
- CircuitPython 驅動（adafruit_dht）在樹莓派上通常需要 `libgpiod`，並且需要以 root 身份執行或設定 gpiod 權限。
- 傳統的 `Adafruit_DHT` read_retry 較容易在 Pi 上直接使用（但需提前安裝）。
"""

import argparse
import time
import sys


def try_adafruit(pin):
    try:
        import board
        import adafruit_dht
    except Exception as e:
        return None, f"adafruit import failed: {e}"

    # map BCM pin to board pin constant (board.D4 etc.)
    try:
        board_pin = getattr(board, f"D{pin}")
    except Exception:
        # board pin names sometimes differ but D4 for BCM4 is common
        # fallback: try using pin number via digitalio? we'll just fail gracefully
        return None, f"cannot map BCM {pin} to board pin (need board.D{pin})"

    dht = None
    try:
        dht = adafruit_dht.DHT22(board_pin)
        # 讀 5 次嘗試，直到成功或超時
        for i in range(5):
            try:
                t = dht.temperature
                h = dht.humidity
                if t is None or h is None:
                    raise RuntimeError("no reading")
                return {"temperature_c": float(t), "humidity_pct": float(h), "driver": "adafruit_dht"}, None
            except RuntimeError as re:
                # 常見 transient errors
                time.sleep(1.0)
                continue
        return None, "adafruit_dht: timed out reading sensor after retries"
    except Exception as e:
        return None, f"adafruit runtime error: {e}"
    finally:
        try:
            if dht:
                dht.exit()
        except Exception:
            pass


def try_Adafruit_DHT(pin):
    try:
        import Adafruit_DHT
    except Exception as e:
        return None, f"Adafruit_DHT import failed: {e}"

    try:
        # Adafruit_DHT uses BCM pin numbers directly
        humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, pin)
        if humidity is None or temperature is None:
            return None, "Adafruit_DHT read_retry returned None (no reading)"
        return {"temperature_c": float(temperature), "humidity_pct": float(humidity), "driver": "Adafruit_DHT"}, None
    except Exception as e:
        return None, f"Adafruit_DHT runtime error: {e}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pin", type=int, default=4, help="BCM pin number for DHT data (default: 4)")
    args = parser.parse_args()

    pin = args.pin
    print(f"Testing DHT22 on BCM pin {pin}\n")

    print("Trying CircuitPython adafruit_dht...")
    res, err = try_adafruit(pin)
    if res:
        print("OK (adafruit_dht):")
        print(f"  Temperature: {res['temperature_c']:.2f} °C")
        print(f"  Humidity: {res['humidity_pct']:.2f} %")
        sys.exit(0)
    else:
        print("adafruit failed:", err)

    print("\nTrying legacy Adafruit_DHT read_retry...")
    res, err = try_Adafruit_DHT(pin)
    if res:
        print("OK (Adafruit_DHT):")
        print(f"  Temperature: {res['temperature_c']:.2f} °C")
        print(f"  Humidity: {res['humidity_pct']:.2f} %")
        sys.exit(0)
    else:
        print("Adafruit_DHT failed:", err)

    print("\nNo supported DHT driver succeeded. To install common dependencies, run:")
    print("  sudo apt update && sudo apt install -y python3-pip libgpiod2")
    print("  source .venv/bin/activate   # if using venv")
    print("  pip install adafruit-circuitpython-dht Adafruit_DHT")
    print("注意：adafruit-circuitpython-dht 可能需要以 root 執行 (sudo)")
    sys.exit(2)


if __name__ == '__main__':
    main()
