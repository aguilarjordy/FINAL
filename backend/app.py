from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from achievements import record_vocal, check_new_achievements, get_progress, reset_achievements
import os

# 👇 importar blueprint matemático
from math_routes import math_bp


app = Flask(__name__)

# ✅ Permitimos tanto local como producción
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://final-1-h9n9.onrender.com",
    "https://final-jesus-front.onrender.com"
]}})

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://final-1-h9n9.onrender.com"
    ]
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,DELETE"
    return response


# ------------------ 📌 VARIABLES GLOBALES ------------------
landmarks_data = {}
model = None
label_map = {}


@app.route('/')
def home():
    return jsonify({"status": "backend running 🚀"})


# ------------------ 📌 RUTAS DE VOCALES ------------------

@app.route('/upload_landmarks', methods=['POST'])
def upload_landmarks():
    data = request.get_json()
    if not data or 'label' not in data or 'landmarks' not in data:
        return jsonify({'error': 'label and landmarks required'}), 400

    label = str(data['label']).strip()
    arr = np.array(data['landmarks'], dtype=np.float32)

    if label not in landmarks_data:
        landmarks_data[label] = []
    landmarks_data[label].append(arr)

    return jsonify({
        'message': 'saved in memory',
        'label': label,
        'count': len(landmarks_data[label])
    }), 200


@app.route('/count', methods=['GET'])
def count():
    counts = {label: len(samples) for label, samples in landmarks_data.items()}
    return jsonify(counts), 200


@app.route('/train_landmarks', methods=['POST'])
def train_landmarks():
    global model, label_map
    if len(landmarks_data) < 2:
        return jsonify({'error': 'Need at least 2 labels with samples'}), 400

    X, y = [], []
    labels = sorted(landmarks_data.keys())
    label_map = {i: labels[i] for i in range(len(labels))}

    for idx, label in enumerate(labels):
        for arr in landmarks_data[label]:
            X.append(arr.flatten())
            y.append(idx)

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(len(labels), activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    model.fit(X, y, epochs=10, batch_size=16, verbose=0)

    return jsonify({'message': 'trained in memory', 'classes': label_map}), 200


@app.route('/predict_landmarks', methods=['POST'])
def predict_landmarks():
    global model, label_map
    data = request.get_json()

    if not data or 'landmarks' not in data:
        return jsonify({'error': 'landmarks required'}), 400
    if model is None:
        return jsonify({'status': 'not_trained'}), 200

    lm = np.array(data['landmarks'], dtype=np.float32).flatten().reshape(1, -1)

    preds = model.predict_on_batch(lm)[0]
    idx = int(np.argmax(preds))
    predicted_vocal = label_map.get(idx, str(idx))
    confidence = float(preds[idx])

    prev_progress = get_progress()
    new_progress = record_vocal(predicted_vocal, correct=True)
    new_achievements = check_new_achievements(prev_progress, new_progress)

    return jsonify({
        'status': 'ok',
        'prediction': predicted_vocal,
        'confidence': confidence,
        'progress': new_progress,
        'new_achievements': new_achievements
    }), 200


@app.route('/reset', methods=['POST'])
def reset():
    global landmarks_data, model, label_map
    landmarks_data = {}
    model = None
    label_map = {}
    return jsonify({'message': 'memory cleared'}), 200


# ------------------ 🎯 ENDPOINTS DE LOGROS ------------------

@app.route("/api/achievements/record", methods=["POST"])
def api_record_achievement():
    data = request.get_json(force=True) if request.is_json else {}
    vocal = data.get("vocal")
    correct = data.get("correct", True)
    if not vocal:
        return jsonify({"error": "missing 'vocal' field"}), 400

    prev = get_progress()
    new = record_vocal(vocal, correct)
    unlocked = check_new_achievements(prev, new)
    return jsonify({"progress": new, "new_achievements": unlocked})


@app.route("/api/achievements/progress", methods=["GET"])
def api_progress():
    progress = get_progress()

    unlocked = []
    for key, value in progress.items():
        if value:
            unlocked.append(key)

    return jsonify({"unlocked": unlocked}), 200


@app.route("/api/achievements/reset", methods=["POST"])
def api_reset_achievements():
    reset_achievements()
    return jsonify({"message": "achievements reset"}), 200


# ------------------ 📌 REGISTRAR BLUEPRINT DE MATH ------------------
app.register_blueprint(math_bp, url_prefix="/api/math")


# ------------------ 🚀 MAIN ------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
