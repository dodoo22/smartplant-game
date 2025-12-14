import time
import RPi.GPIO as GPIO

PIN = 14

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

print("SET OUTPUT HIGH (1) for 3s")
GPIO.setup(PIN, GPIO.OUT, initial=GPIO.HIGH)
time.sleep(3)

print("SET OUTPUT LOW (0) for 3s")
GPIO.output(PIN, GPIO.LOW)
time.sleep(3)

print("SET OUTPUT HIGH (1) for 3s")
GPIO.output(PIN, GPIO.HIGH)
time.sleep(3)

print("DONE -> set OFF then keep OUTPUT (no cleanup)")
GPIO.output(PIN, GPIO.HIGH)  # 先假設 HIGH=OFF，等你觀察完再改
while True:
    time.sleep(1)