# backend/math_routes.py
from flask import Blueprint, request, jsonify
import numpy as np
import tensorflow as tf

math_bp = Blueprint("math_bp", __name__)

# ------------------ 📌 VARIABLES GLOBALES ------------------
landmarks_data_math = {}
model_math = None
label_map_math = {}


# ------------------ 📌 SUBIR LANDMARKS ------------------
@math_bp.route('/upload_landmarks', methods=['POST'])
def upload_landmarks_math():
    global landmarks_data_math
    data = request.get_json()
    if not data or "label" not in data or "landmarks" not in data:
        return jsonify({"error": "label and landmarks required"}), 400

    label = str(data["label"]).strip()
    arr = np.array(data["landmarks"], dtype=np.float32)

    # ✅ Normalizar a 42 landmarks (2 manos). Cada landmark tiene 3 coords (x,y,z).
    if arr.size == 21 * 3:  
        # si solo hay 1 mano, rellenamos con ceros la segunda
        arr = np.concatenate([arr, np.zeros(21 * 3, dtype=np.float32)])
    elif arr.size > 42 * 3:  
        # si vienen más, nos quedamos con los primeros 42
        arr = arr[:42 * 3]

    if label not in landmarks_data_math:
        landmarks_data_math[label] = []
    landmarks_data_math[label].append(arr)

    return jsonify({
        "message": "saved in memory",
        "label": label,
        "count": len(landmarks_data_math[label])
    }), 200


# ------------------ 📌 CONTAR MUESTRAS ------------------
@math_bp.route('/count', methods=['GET'])
def count_math():
    counts = {label: len(samples) for label, samples in landmarks_data_math.items()}
    return jsonify(counts), 200


# ------------------ 📌 ENTRENAR ------------------
@math_bp.route('/train', methods=['POST'])
def train_math():
    global model_math, label_map_math
    if len(landmarks_data_math) < 2:
        return jsonify({"error": "Need at least 2 labels with samples"}), 400

    X, y = [], []
    labels = sorted(landmarks_data_math.keys())
    label_map_math = {i: labels[i] for i in range(len(labels))}

    for idx, label in enumerate(labels):
        for arr in landmarks_data_math[label]:
            X.append(arr.flatten())
            y.append(idx)

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)

    model_math = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation="relu"),
        tf.keras.layers.Dense(len(labels), activation="softmax")
    ])
    model_math.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model_math.fit(X, y, epochs=10, batch_size=16, verbose=0)

    return jsonify({"message": "trained in memory", "classes": label_map_math}), 200


# ------------------ 📌 PREDICCIÓN ------------------
@math_bp.route('/predict', methods=['POST'])
def predict_landmarks_math():
    global model_math, label_map_math
    data = request.get_json()

    if not data or "landmarks" not in data:
        return jsonify({"error": "landmarks required"}), 400
    if model_math is None:
        return jsonify({"status": "not_trained"}), 200

    arr = np.array(data["landmarks"], dtype=np.float32)

    # ✅ Normalizar a 42 landmarks
    if arr.size == 21 * 3:
        arr = np.concatenate([arr, np.zeros(21 * 3, dtype=np.float32)])
    elif arr.size > 42 * 3:
        arr = arr[:42 * 3]

    lm = arr.flatten().reshape(1, -1)

    preds = model_math.predict_on_batch(lm)[0]
    idx = int(np.argmax(preds))
    predicted_math = label_map_math.get(idx, str(idx))
    confidence = float(preds[idx])

    return jsonify({
        "status": "ok",
        "prediction": predicted_math,
        "confidence": confidence
    }), 200


# ------------------ 📌 REINICIAR ------------------
@math_bp.route('/reset', methods=['POST'])
def reset_math():
    global landmarks_data_math, model_math, label_map_math
    landmarks_data_math = {}
    model_math = None
    label_map_math = {}
    return jsonify({"message": "math memory cleared"}), 200
