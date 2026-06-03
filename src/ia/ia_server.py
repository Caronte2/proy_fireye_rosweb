"""
ia_server.py — Servidor de streaming de vídeo con detección YOLO

Captura la webcam del servidor, ejecuta el modelo YOLO (.pt) de Ultralytics
sobre cada frame y sirve el vídeo anotado como stream MJPEG por HTTP.

Uso:
    python ia_server.py                          # webcam 0, modelo yolov8n.pt, puerto 5000
    python ia_server.py --model mi_modelo.pt     # modelo personalizado
    python ia_server.py --camera 1               # otra webcam
    python ia_server.py --port 5001              # otro puerto

Endpoints:
    GET  /video_feed  → Stream MJPEG con detecciones dibujadas
    POST /toggle      → Activa/desactiva la inferencia YOLO (el stream sigue sin procesar)
    GET  /status      → Devuelve {"active": true/false}
"""

import argparse
import threading
import cv2
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from ultralytics import YOLO

# ═══════════════════════════════════════════
#  Configuración por línea de comandos
# ═══════════════════════════════════════════
parser = argparse.ArgumentParser(description='Servidor YOLO + Webcam')
parser.add_argument('--model',  type=str, default='yolov8n.pt', help='Ruta al modelo .pt (default: yolov8n.pt)')
parser.add_argument('--camera', type=int, default=0,            help='Índice de la webcam (default: 0)')
parser.add_argument('--port',   type=int, default=5000,         help='Puerto del servidor (default: 5000)')
parser.add_argument('--conf',   type=float, default=0.5,        help='Umbral de confianza YOLO (default: 0.5)')
args = parser.parse_args()

# ═══════════════════════════════════════════
#  Inicialización
# ═══════════════════════════════════════════

app = Flask(__name__)
CORS(app)  # Permite peticiones desde el frontend (distinto puerto)

# Cargar el modelo YOLO
print(f'[IA Server] Cargando modelo: {args.model}')
model = YOLO(args.model)
print(f'[IA Server] Modelo cargado correctamente.')

# Estado de la inferencia (activada/desactivada) y últimas detecciones
ia_active = False
latest_detections = []
ia_lock = threading.Lock()

# Captura de la webcam
cap = cv2.VideoCapture(args.camera)
if not cap.isOpened():
    print(f'[IA Server] ERROR: No se pudo abrir la webcam {args.camera}')
    exit(1)
print(f'[IA Server] Webcam {args.camera} abierta correctamente.')


# ═══════════════════════════════════════════
#  Generador de frames (MJPEG)
# ═══════════════════════════════════════════

def generate_frames():
    """
    Lee frames de la webcam en bucle.
    Si la IA está activa, ejecuta YOLO y dibuja las detecciones.
    Si no, envía el frame sin procesar.
    Devuelve cada frame codificado como JPEG dentro de un boundary MJPEG.
    """
    global latest_detections
    while True:
        success, frame = cap.read()
        if not success:
            break

        # Comprobar si la inferencia está activada
        with ia_lock:
            active = ia_active

        current_detections = []
        if active:
            # Ejecutar YOLO sobre el frame y dibujar las bounding boxes
            results = model.predict(frame, conf=args.conf, verbose=False)
            frame = results[0].plot()  # Devuelve el frame con las detecciones dibujadas

            # Obtener nombres de las clases detectadas en este frame
            names = results[0].names
            for c in results[0].boxes.cls:
                class_name = names[int(c)]
                current_detections.append(class_name)

        with ia_lock:
            latest_detections = current_detections

        # Codificar el frame como JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue

        # Formato MJPEG: cada frame separado por un boundary
        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n'
        )


# ═══════════════════════════════════════════
#  Endpoints
# ═══════════════════════════════════════════

@app.route('/video_feed')
def video_feed():
    """Stream MJPEG — el navegador lo consume directamente en un <img> tag."""
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/toggle', methods=['POST'])
def toggle():
    """Activa o desactiva la inferencia YOLO. El stream sigue en ambos casos."""
    global ia_active
    with ia_lock:
        ia_active = not ia_active
        state = ia_active
    print(f'[IA Server] Inferencia {"ACTIVADA" if state else "DESACTIVADA"}')
    return jsonify({'active': state})


@app.route('/status')
def status():
    """Devuelve el estado actual de la inferencia y las últimas detecciones."""
    global latest_detections
    with ia_lock:
        return jsonify({
            'active': ia_active,
            'detections': latest_detections if ia_active else []
        })


# ═══════════════════════════════════════════
#  Arranque del servidor
# ═══════════════════════════════════════════

if __name__ == '__main__':
    print(f'[IA Server] Servidor arrancando en http://localhost:{args.port}')
    print(f'[IA Server] Endpoints:')
    print(f'    GET  http://localhost:{args.port}/video_feed  → Stream MJPEG')
    print(f'    POST http://localhost:{args.port}/toggle      → Activar/desactivar IA')
    print(f'    GET  http://localhost:{args.port}/status      → Estado actual')
    app.run(host='0.0.0.0', port=args.port, threaded=True)
