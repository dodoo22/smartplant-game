from flask import Blueprint, Response, jsonify, request, send_from_directory
# 避免與主應用的 Picamera2 衝突：這個模組改為延遲初始化
import cv2
import time
import os
from threading import Lock
import logging

camera_bp = Blueprint("camera", __name__)

# 延遲初始化的 picam2 實例（只有在端點被使用時才建立）
picam2 = None

frame_lock = Lock()
latest_frame = None

PHOTO_DIR = "./photos"
os.makedirs(PHOTO_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def _ensure_camera_started():
    """Lazy start Picamera2 for this blueprint only if enabled explicitly.
    為避免與主 app 的單例衝突，僅在環境變數 ENABLE_CAMERA_BP=1 時啟用。
    """
    global picam2
    if os.environ.get("ENABLE_CAMERA_BP", "0") != "1":
        raise RuntimeError("camera blueprint disabled; set ENABLE_CAMERA_BP=1 to enable")
    if picam2 is None:
        from picamera2 import Picamera2
        picam2 = Picamera2()
        picam2.configure(
            picam2.create_video_configuration(
                main={"size": (640, 480), "format": "RGB888"}
            )
        )
        picam2.start()


# ========= 背景抓影像（按需啟動） =========
def camera_loop():
    global latest_frame
    while True:
        frame = picam2.capture_array()
        with frame_lock:
            latest_frame = frame
        time.sleep(0.03)  # ~30fps

def _ensure_loop_running():
    import threading
    # 啟用時才開背景執行緒
    if os.environ.get("ENABLE_CAMERA_BP", "0") == "1":
        if not any(isinstance(t, threading.Thread) and t.name == "camera_loop" for t in threading.enumerate()):
            th = threading.Thread(target=camera_loop, daemon=True, name="camera_loop")
            th.start()


# ========= 即時串流（MJPEG） =========
def mjpeg_generator():
    logging.info("Starting MJPEG generator...")
    while True:
        with frame_lock:
            if latest_frame is None:
                logging.warning("No frame available for MJPEG generator.")
                continue
            frame = latest_frame.copy()

        try:
            _, jpeg = cv2.imencode(".jpg", frame)
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" +
                jpeg.tobytes() +
                b"\r\n"
            )
            logging.debug("MJPEG frame generated.")
        except Exception as e:
            logging.error(f"Error in MJPEG generator: {e}")
        time.sleep(0.03)


@camera_bp.route("/camera/stream")
def camera_stream():
    logging.info("/camera/stream endpoint called.")
    api_key = request.args.get("api_key")
    if api_key != os.environ.get("WATER_API_KEY"):
        logging.warning("Unauthorized access to /camera/stream.")
        return "Unauthorized", 401

    # Ensure picamera2 is initialized
    global picam2
    try:
        _ensure_camera_started()
        _ensure_loop_running()
    except Exception as e:
        logging.error(f"Failed to initialize picamera2: {e}")
        return jsonify(ok=False, error="no_camera_tool", detail=str(e)), 500

    logging.info("Starting MJPEG stream.")
    return Response(
        mjpeg_generator(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


# ========= 拍照 =========
@camera_bp.route("/camera/capture", methods=["POST"])
def camera_capture():
    logging.info("/camera/capture endpoint called.")
    api_key = request.headers.get("x-api-key")
    if api_key != os.environ.get("WATER_API_KEY"):
        logging.warning("Unauthorized access to /camera/capture.")
        return jsonify(ok=False, error="unauthorized"), 401

    try:
        _ensure_camera_started()
        _ensure_loop_running()
    except Exception as e:
        logging.error(f"Failed to initialize picamera2 for capture: {e}")
        return jsonify(ok=False, error="no_camera_tool", detail=str(e)), 500

    with frame_lock:
        if latest_frame is None:
            logging.error("No frame available for capture.")
            return jsonify(ok=False, error="no frame"), 500
        frame = latest_frame.copy()

    filename = f"{int(time.time())}.jpg"
    path = os.path.join(PHOTO_DIR, filename)
    try:
        cv2.imwrite(path, cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
        logging.info(f"Photo saved to {path}.")
    except Exception as e:
        logging.error(f"Error saving photo: {e}")
        return jsonify(ok=False, error="save_failed", detail=str(e)), 500

    return jsonify(ok=True, url=f"/photos/{filename}")