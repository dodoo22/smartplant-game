import time

try:
    import RPi.GPIO as GPIO
except Exception:
    GPIO = None

_pump_pin: int | None = None
_mock: bool = True
_active_low: bool = True  # True: LOW=ON, HIGH=OFF


def _off_level():
    # active_low=True -> HIGH = OFF
    return GPIO.HIGH if _active_low else GPIO.LOW


def _on_level():
    # active_low=True -> LOW = ON
    return GPIO.LOW if _active_low else GPIO.HIGH


def _release_to_input():
    """
    把 pin 釋放為 INPUT（你要的邏輯：閒置時不主動驅動 GPIO）
    """
    if GPIO is None or _pump_pin is None:
        return
    try:
        GPIO.setup(_pump_pin, GPIO.IN)
    except Exception:
        pass


def init_pump(pin: int, mock: bool = False, active_low: bool = True):
    """
    初始化：
    1) 設 OUTPUT 並拉到 OFF（避免一啟動就轉）
    2) 立刻釋放成 INPUT（idle 不驅動）
    """
    global _pump_pin, _mock, _active_low
    _pump_pin = int(pin)
    _mock = bool(mock)
    _active_low = bool(active_low)

    if _mock:
        print("[PUMP] mock mode ON")
        return True, "mock"

    if GPIO is None:
        return False, "RPi.GPIO not available"

    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)

    # ✅ 關鍵：先用 OUTPUT 施加 OFF
    GPIO.setup(_pump_pin, GPIO.OUT, initial=_off_level())
    GPIO.output(_pump_pin, _off_level())

    # ✅ 釋放成 INPUT（你要的）
    _release_to_input()

    print(f"[PUMP] init ok pin={_pump_pin} active_low={_active_low} (idle=INPUT)")
    return True, "ok"


def pulse_pump(sec: float):
    """
    澆水：
    1) pin -> OUTPUT (OFF)
    2) ON sec 秒
    3) OFF
    4) pin -> INPUT（釋放）
    """
    if _mock:
        print(f"[PUMP] mock pulse {sec}s")
        time.sleep(sec)
        return True, "mock"

    if GPIO is None or _pump_pin is None:
        return False, "pump not initialized"

    try:
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)

        # ✅ 確保是 OUTPUT，並先 OFF
        GPIO.setup(_pump_pin, GPIO.OUT, initial=_off_level())
        GPIO.output(_pump_pin, _off_level())

        # ✅ 開
        GPIO.output(_pump_pin, _on_level())
        time.sleep(sec)

        # ✅ 關
        GPIO.output(_pump_pin, _off_level())

        # ✅ 釋放成 INPUT
        _release_to_input()

        return True, "ok"
    except Exception as e:
        # 失敗也盡量回到安全狀態
        try:
            if GPIO is not None and _pump_pin is not None:
                GPIO.setup(_pump_pin, GPIO.OUT, initial=_off_level())
                GPIO.output(_pump_pin, _off_level())
                _release_to_input()
        except Exception:
            pass
        return False, str(e)


def cleanup():
    """
    程式結束：
    先 OFF，再釋放 INPUT，再 cleanup 這一腳
    """
    if _mock or GPIO is None or _pump_pin is None:
        return
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(_pump_pin, GPIO.OUT, initial=_off_level())
        GPIO.output(_pump_pin, _off_level())
        _release_to_input()
        GPIO.cleanup(_pump_pin)
    except Exception:
        pass