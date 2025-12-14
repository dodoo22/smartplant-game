import os
import time
import uuid
import subprocess
from datetime import datetime, date

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import threading

from sensors import read_all_sensors
from pump import init_pump, pulse_pump, cleanup

load_dotenv()

# ===== 環境設定 =====
SENSOR_MOCK = os.getenv("MOCK_SENSORS", "1") == "1"
PUMP_MOCK = os.getenv("PUMP_MOCK", "1") == "1"

API_KEY = os.getenv("WATER_API_KEY", "CHANGE_ME")
PUMP_PIN = int(os.getenv("PUMP_PIN", "17"))

DAILY_LIMIT = float(os.getenv("DAILY_LIMIT_SEC", "30"))
COOLDOWN = float(os.getenv("COOLDOWN_SEC", "60"))

# ===== Flask =====
app = Flask(__name__)
CORS(app)

# 存照片的資料夾（你前端會用 /photos/<filename> 來讀）
PHOTOS_DIR = os.path.join(os.path.dirname(__file__), "photos")
os.makedirs(PHOTOS_DIR, exist_ok=True)

# ===== Picamera2 單例與鎖 =====
PICAM = None  # type: Picamera2 | None
CAP_LOCK = threading.Lock()

daily_sec = 0.0
last_day = date.today()
last_water_at: datetime | None = None

ok, msg = init_pump(PUMP_PIN, mock=PUMP_MOCK, active_low=True)
print(f"[DEBUG] init_pump ok={ok} msg={msg} mock={PUMP_MOCK}", flush=True)


def reset_if_new_day():
    global daily_sec, last_day
    if date.today() != last_day:
        daily_sec = 0.0
        last_day = date.today()


@app.get("/status")
def status():
    reset_if_new_day()
    data = read_all_sensors(mock=SENSOR_MOCK)
    return jsonify(
        {
            "humidity": data["soil_pct"],
            "temperature": data["temp_c"],
            "light": data["lux"],
            "env_humi": data["humi_pct"],
            "touch": data["touch"],
            "daily_sec": round(daily_sec, 1),
            "last_water_at": last_water_at.strftime("%Y-%m-%d %H:%M:%S") if last_water_at else None,
        }
    )


@app.post("/water")
def water():
    global daily_sec, last_water_at

    key = request.values.get("api_key") or request.headers.get("x-api-key")
    if key != API_KEY:
        return jsonify({"ok": False, "error": "unauthorized"}), 401

    try:
        sec = float(request.values.get("sec", "2"))
        sec = max(0.5, min(sec, 10.0))
    except Exception:
        sec = 2.0

    reset_if_new_day()

    if last_water_at and (datetime.now() - last_water_at).total_seconds() < COOLDOWN:
        return jsonify({"ok": False, "error": "cooldown"}), 429

    if daily_sec + sec > DAILY_LIMIT:
        return jsonify({"ok": False, "error": "daily_limit"}), 429

    ok, msg = pulse_pump(sec)
    if not ok:
        return jsonify({"ok": False, "error": msg}), 500

    daily_sec += sec
    last_water_at = datetime.now()

    return jsonify(
        {"ok": True, "message": f"watered {sec}s", "daily_sec": round(daily_sec, 1), "mock": PUMP_MOCK}
    )


def _do_capture(path: str):
    """Capture a JPEG to `path` using Picamera2 singleton with locking."""
    # Small helper for logging
    def _log(msg: str):
        print(f"[CAPTURE] {msg}", flush=True)

    # Try a couple of attempts with short backoff to avoid transient device/DRM hiccups
    # Keep total wait under ~1.5s to ensure frontend doesn't hang when hardware is unhappy
    attempts = 2
    delay_sec = 0.4
    # Preferred: Picamera2 via singleton
    try:
        from picamera2 import Picamera2
        global PICAM
        with CAP_LOCK:
            for i in range(attempts):
                try:
                    _log(f"Picamera2 singleton try {i+1}/{attempts}")
                    if PICAM is None:
                        _log("Creating Picamera2 singleton")
                        PICAM = Picamera2()
                        PICAM.configure(PICAM.create_still_configuration())
                        PICAM.start()
                        time.sleep(delay_sec)

                    # capture
                    PICAM.capture_file(path)
                    if not os.path.exists(path):
                        raise RuntimeError("picamera2 did not create file")
                    _log("Picamera2 capture success")
                    return
                except Exception as e:
                    _log(f"Picamera2 capture error: {e}")
                    # hard reset: stop and close, then recreate cleanly
                    try:
                        _log("Resetting camera: stop/close and re-init")
                        if PICAM:
                            try:
                                PICAM.stop()
                            except Exception:
                                pass
                            try:
                                # Picamera2.close() releases resources fully
                                PICAM.close()
                            except Exception:
                                pass
                        PICAM = None
                        # small backoff before re-init
                        time.sleep(delay_sec)
                        PICAM = Picamera2()
                        PICAM.configure(PICAM.create_still_configuration())
                        PICAM.start()
                        time.sleep(delay_sec)
                    except Exception as e2:
                        _log(f"Reset failed: {e2}")
                    time.sleep(delay_sec)
        # If Picamera2 is present but failed at runtime, fall back below
        print("[WARN] Picamera2 present but capture failed; fallback to libcamera-still", flush=True)
    except ImportError:
        # Picamera2 not importable; will fallback to libcamera-still
        print("[WARN] picamera2 not importable, fallback to libcamera-still", flush=True)

    # Fallback: libcamera-still via subprocess (available on Raspberry Pi OS)
    # -o path : output file
    # --autofocus : try AF if supported; safe to omit on fixed-focus modules
    # -t 500 : short preview time in ms
    # --width/--height can be omitted to let libcamera pick defaults
    try:
        cmd = [
            "libcamera-still",
            "-o", path,
            "-t", "500",
            "--immediate",  # capture immediately without lengthy preview
            "-q", "90",      # jpeg quality
        ]
        # Run with a timeout to avoid hanging
        print(f"[DEBUG] running fallback: {' '.join(cmd)}", flush=True)
        subprocess.run(cmd, check=True, timeout=10, capture_output=True)
        if not os.path.exists(path):
            raise RuntimeError("libcamera-still did not create file")
        _log("libcamera-still capture success")
    except FileNotFoundError:
        # libcamera-still command not found and Picamera2 import previously failed
        raise FileNotFoundError("neither picamera2 nor libcamera-still is available")
    except subprocess.TimeoutExpired as te:
        raise RuntimeError(f"libcamera-still timeout: {te}")
    except subprocess.CalledProcessError as cpe:
        err = cpe.stderr.decode() if getattr(cpe, 'stderr', None) else str(cpe)
        raise RuntimeError(f"libcamera-still failed: {err}")


def _write_placeholder_jpeg(path: str, text: str = "camera unavailable"):
    """Write a small placeholder JPEG so frontend can still display something."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new("RGB", (800, 600), color=(240, 240, 240))
        draw = ImageDraw.Draw(img)
        msg = f"{text}"
        draw.text((20, 20), msg, fill=(0, 0, 0))
        img.save(path, format="JPEG", quality=85)
    except Exception:
        # Fallback: write a tiny embedded JPEG (1x1 white pixel)
        import base64
        tiny_jpeg_b64 = (
            
            "\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBxISEBUREBIVFhUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf\/AABEIAAEAAQMBIgACEQEDEQH\/xAAWAAEBAQAAAAAAAAAAAAAAAAADAgT\/EAB0QAQADAQEAAwAAAAAAAAAAAAECAxEEEiExQZH\/2gAMAwEAAhEDEQA\/AKuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf\/9k="
        )
        with open(path, "wb") as f:
            f.write(base64.b64decode(tiny_jpeg_b64))


@app.route("/camera/capture", methods=["GET", "POST"])
def camera_capture():
    key = request.values.get("api_key") or request.headers.get("x-api-key")
    if key != API_KEY:
        return jsonify({"ok": False, "error": "unauthorized"}), 401

    filename = f"photo_{int(time.time())}_{uuid.uuid4().hex[:6]}.jpg"
    path = os.path.join(PHOTOS_DIR, filename)

    try:
        _do_capture(path)
    except (FileNotFoundError, RuntimeError) as e:
        # Write a placeholder so frontend still works; include error details in JSON for visibility
        placeholder_name = f"placeholder_{int(time.time())}_{uuid.uuid4().hex[:6]}.jpg"
        path = os.path.join(PHOTOS_DIR, placeholder_name)
        _write_placeholder_jpeg(path, text=str(e))
        url = f"/photos/{os.path.basename(path)}"
        if request.method == "GET":
            from flask import redirect
            # Redirect to placeholder but use 302
            return redirect(url)
        return jsonify({"ok": True, "url": url, "placeholder": True, "error": str(e)})

    # On GET return a redirect so browsers can open the image URL directly;
    # on POST return a JSON with the photo URL.
    url = f"/photos/{filename}"
    if request.method == "GET":
        from flask import redirect

        return redirect(url)
    return jsonify({"ok": True, "url": url})


@app.get('/camera/stream')
def camera_stream():
    """Return a single JPEG frame inline (no redirect).
    This is friendlier to some <img> clients that don't follow redirects reliably.
    """
    key = request.args.get("api_key") or request.headers.get("x-api-key")
    if key != API_KEY:
        return jsonify({"ok": False, "error": "unauthorized"}), 401

    filename = f"photo_{int(time.time())}_{uuid.uuid4().hex[:6]}.jpg"
    path = os.path.join(PHOTOS_DIR, filename)

    try:
        _do_capture(path)
    except (FileNotFoundError, RuntimeError) as e:
        # fallback to placeholder image
        placeholder_name = f"placeholder_{int(time.time())}_{uuid.uuid4().hex[:6]}.jpg"
        path = os.path.join(PHOTOS_DIR, placeholder_name)
        _write_placeholder_jpeg(path, text=str(e))

    # Inline return the image bytes, set no-store headers to avoid caching
    from flask import send_file
    resp = send_file(path, mimetype="image/jpeg")
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    return resp


@app.get("/camera/health")
def camera_health():
    """Simple health check for camera availability and environment.
    Returns whether API key auth would pass (not required here), Picamera2 importable,
    and whether singleton is initialized. Does not touch the sensor to avoid conflicts.
    """
    info = {
        "api_key_set": bool(API_KEY and API_KEY != "CHANGE_ME"),
        "picamera2_import": False,
        "singleton_initialized": False,
        "photos_dir_writable": False,
    }
    # Picamera2 import test
    try:
        from picamera2 import Picamera2  # noqa: F401
        info["picamera2_import"] = True
    except Exception:
        info["picamera2_import"] = False

    # Singleton state
    info["singleton_initialized"] = PICAM is not None

    # Photos dir writable
    try:
        test_name = f"health_{uuid.uuid4().hex[:6]}.tmp"
        test_path = os.path.join(PHOTOS_DIR, test_name)
        with open(test_path, "wb") as f:
            f.write(b"ok")
        os.remove(test_path)
        info["photos_dir_writable"] = True
    except Exception:
        info["photos_dir_writable"] = False

    return jsonify({"ok": True, "camera": info})


@app.get("/photos/<path:filename>")
def get_photo(filename):
    return send_from_directory(PHOTOS_DIR, filename)


if __name__ == "__main__":
    try:
        print("[DEBUG] routes:", [r.rule for r in app.url_map.iter_rules()], flush=True)
        print("[DEBUG] app starting...", flush=True)
        # Initialize camera singleton early (best-effort)
        try:
            from picamera2 import Picamera2
            print("[DEBUG] initializing camera singleton", flush=True)
            PICAM = Picamera2()
            PICAM.configure(PICAM.create_still_configuration())
            PICAM.start()
            time.sleep(0.3)
            print("[DEBUG] camera initialized", flush=True)
        except Exception as e:
            print(f"[WARN] camera init skipped: {e}", flush=True)
        app.run(host="0.0.0.0", port=8000)
    finally:
        try:
            if PICAM:
                PICAM.stop()
        except Exception:
            pass
        cleanup()