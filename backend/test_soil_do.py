import time
import RPi.GPIO as GPIO

SOIL_PIN = 14

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(SOIL_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

try:
    while True:
        v = GPIO.input(SOIL_PIN)
        print("DO =", v, "=>", "濕" if v == 1 else "乾")
        time.sleep(0.5)
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
