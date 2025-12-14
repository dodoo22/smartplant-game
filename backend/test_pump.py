import RPi.GPIO as GPIO
import time

PIN = 27

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

# ✅ 一開始就設定為 OUTPUT，並且 initial=HIGH（多數 active-low relay：HIGH=OFF）
GPIO.setup(PIN, GPIO.OUT, initial=GPIO.HIGH)
time.sleep(10)
GPIO.setup(PIN, GPIO.IN)  # 設回 INPUT，等同於釋放腳位
time.sleep(2)
GPIO.setup(PIN, GPIO.OUT, initial=GPIO.HIGH)
time.sleep(10)


GPIO.cleanup()
print("done")
