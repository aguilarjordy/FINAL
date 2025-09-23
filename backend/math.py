from flask import Blueprint, request, jsonify
import numpy as np
import joblib
import os

math_bp = Blueprint("math", __name__)

# Carpeta donde guardamos dataset y modelo
DATASET_PATH = "datasets/math_data.npy"
LABELS_PATH = "datasets/math_labels.npy"
MODEL_PATH = "models/math_model.pkl"

# Variables en memoria
X_math, y_math = [], []
model_math = None


@math_bp.route("/upload_landmarks_math", methods=["POST"])
def upload_landmarks_math():
    global X_math, y_math
    data = request.json
    landmarks = data.get("landmarks")
    label = data.get("label")

    if not landmarks or not label:
        return jsonify({"error": "Faltan datos"}), 400

    X_math.append(np.array(landmarks).flatten())
    y_math.append(label)

    return jsonify({"status": "ok", "count": len(y_math)})


@math_bp.route("/train_landmarks_math", methods=["POST"])
def train_landmarks_math():
    global model_math
    if not X_math or not y_math:
        return jsonify({"error": "No hay datos suficientes"}), 400

    from sklearn.ensemble import RandomForestClassifier

    model_math = RandomForestClassifier(n_estimators=200)
    model_math.fit(X_math, y_math)

    # Guardar modelo
    joblib.dump(model_math, MODEL_PATH)
    np.save(DATASET_PATH, X_math)
    np.save(LABELS_PATH, y_math)

    return jsonify({"status": "ok", "message": "Modelo matemático entrenado"})


@math_bp.route("/predict_landmarks_math", methods=["POST"])
def predict_landmarks_math():
    global model_math
    data = request.json
    landmarks = data.get("landmarks")

    if not model_math and os.path.exists(MODEL_PATH):
        model_math = joblib.load(MODEL_PATH)

    if not model_math:
        return jsonify({"status": "not_trained"}), 400

    if not landmarks:
        return jsonify({"error": "No se enviaron landmarks"}), 400

    X = np.array(landmarks).flatten().reshape(1, -1)
    pred = model_math.predict(X)[0]
    conf = max(model_math.predict_proba(X)[0])

    return jsonify({"status": "ok", "prediction": pred, "confidence": float(conf)})


@math_bp.route("/counts_math", methods=["GET"])
def counts_math():
    from collections import Counter
    return jsonify(dict(Counter(y_math)))


@math_bp.route("/reset_math", methods=["POST"])
def reset_math():
    global X_math, y_math, model_math
    X_math, y_math, model_math = [], [], None
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    return jsonify({"status": "ok", "message": "Datos de operaciones matemáticas reiniciados"})
