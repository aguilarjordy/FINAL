from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import os

# 📌 Logros de vocales
from achievements import (
    record_vocal,
    check_new_achievements,
    get_progress,
    reset_achievements,
)

# 📌 Funciones auxiliares
from operations import calculate

app = Flask(__name__)

# ✅ Permitimos los dos dominios de frontend de Render y los locales
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://final-1-h9n9.onrender.com",
    "https://final-dev-front.onrender.com"
]}})

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://final-1-h9n9.onrender.com",
        "https://final-dev-front.onrender.com"
    ]
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,DELETE"
    return response

# ------------------ 🔹 VARIABLES EN MEMORIA ------------------
# Para vocales
landmarks_data = {}
model = None
label_map = {}

# Para operaciones aritméticas
operations_data = {}
operations_model = None
operations_label_map = {}


@app.route('/')
def home():
    return jsonify({"status": "backend running 🚀"})


# ============================================================
# 📌 VOCAL RECOGNITION
# ============================================================

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

    # 🔹 Guardar progreso
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


# ============================================================
# 📌 NUEVA RUTA PARA OBTENER CONTEOS
# ============================================================
@app.route('/counts', methods=['GET'])
def get_vowel_counts():
    counts = {label: len(data) for label, data in landmarks_data.items()}
    return jsonify(counts), 200

# ============================================================
# 📌 ARITHMETIC OPERATIONS (ahora con landmarks, no imágenes)
# ============================================================

@app.route('/api/operations/upload', methods=['POST'])
def upload_operations():
    data = request.get_json()
    if not data or 'label' not in data or 'landmarks' not in data:
        return jsonify({'error': 'label and landmarks required'}), 400

    arr = np.array(data['landmarks'], dtype=np.float32)
    label = str(data['label']).strip()

    if label not in operations_data:
        operations_data[label] = []
    operations_data[label].append(arr)

    return jsonify({
        'message': 'saved in memory',
        'label': label,
        'count': len(operations_data[label])
    }), 200


@app.route('/api/operations/train', methods=['POST'])
def train_operations():
    global operations_model, operations_label_map
    if len(operations_data) < 2:
        return jsonify({'error': 'Need at least 2 labels with samples'}), 400

    X, y = [], []
    labels = sorted(operations_data.keys())
    operations_label_map = {i: labels[i] for i in range(len(labels))}

    for idx, label in enumerate(labels):
        for arr in operations_data[label]:
            X.append(arr.flatten())
            y.append(idx)

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)

    operations_model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(len(labels), activation='softmax')
    ])
    operations_model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    operations_model.fit(X, y, epochs=10, batch_size=16, verbose=0)

    return jsonify({'message': 'trained arithmetic model', 'classes': operations_label_map}), 200


@app.route('/api/operations/predict', methods=['POST'])
def predict_operations():
    global operations_model, operations_label_map
    data = request.get_json()

    if not data or 'landmarks' not in data:
        return jsonify({'error': 'landmarks required'}), 400
    if operations_model is None:
        return jsonify({'status': 'not_trained'}), 200

    lm = np.array(data['landmarks'], dtype=np.float32).flatten().reshape(1, -1)
    preds = operations_model.predict_on_batch(lm)[0]
    idx = int(np.argmax(preds))
    prediction = operations_label_map.get(idx, str(idx))
    confidence = float(preds[idx])

    return jsonify({
        'status': 'ok',
        'prediction': prediction,
        'confidence': confidence
    }), 200


@app.route('/api/operations/calculate', methods=['POST'])
def calculate_operation():
    """
    Recibe { "first": 5, "operator": "+", "second": 3 }
    Devuelve { "result": 8 }
    """
    data = request.get_json()
    try:
        a = data.get("first")
        b = data.get("second")
        op = data.get("operator")

        result = calculate(a, op, b)
        return jsonify({"result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ============================================================
# 📌 NUEVA RUTA PARA OBTENER CONTEOS DE OPERACIONES
# ============================================================
@app.route('/api/operations/counts', methods=['GET'])
def get_operations_counts():
    counts = {label: len(data) for label, data in operations_data.items()}
    return jsonify(counts), 200

# ============================================================
# 📌 ENDPOINTS DE LOGROS
# ============================================================

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
    unlocked = [key for key, value in progress.items() if value]
    return jsonify({"unlocked": unlocked}), 200


@app.route("/api/achievements/reset", methods=["POST"])
def api_reset_achievements():
    reset_achievements()
    return jsonify({"message": "achievements reset"}), 200


# ============================================================
# 🚀 MAIN
# ============================================================

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)