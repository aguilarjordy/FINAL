# backend/math_routes.py
from flask import Blueprint, request, jsonify
import numpy as np
import tensorflow as tf

# Crear Blueprint
math_bp = Blueprint("math_bp", __name__)

# Variables globales para matemáticas
landmarks_math_data = {}
model_math = None
label_map_math = {}


@math_bp.route('/upload_landmarks', methods=['POST'])
def upload_landmarks_math():
    global landmarks_data_math
    data = request.get_json()

    if not data or 'label' not in data or 'landmarks' not in data:
        return jsonify({'error': 'label and landmarks required'}), 400

    label = str(data['label']).strip()
    lm = np.array(data['landmarks'], dtype=np.float32).reshape(-1, 3)

    # ✅ Normalizar a 42 puntos
    if lm.shape[0] == 21:
        # Solo una mano → rellenar con ceros
        lm = np.vstack([lm, np.zeros((21, 3), dtype=np.float32)])
    elif lm.shape[0] > 42:
        # Más de 2 manos (no debería pasar) → cortar
        lm = lm[:42]

    if label not in landmarks_data_math:
        landmarks_data_math[label] = []
    landmarks_data_math[label].append(lm)

    return jsonify({
        'message': 'saved in memory',
        'label': label,
        'count': len(landmarks_data_math[label])
    }), 200



@math_bp.route('/count', methods=['GET'])
def count_math():
    counts = {label: len(samples) for label, samples in landmarks_math_data.items()}
    return jsonify(counts), 200


@math_bp.route('/train', methods=['POST'])
def train_landmarks_math():
    global model_math, label_map_math, landmarks_data_math

    if len(landmarks_data_math) < 2:
        return jsonify({'error': 'Need at least 2 labels with samples'}), 400

    X, y = [], []
    labels = sorted(landmarks_data_math.keys())
    label_map_math = {i: labels[i] for i in range(len(labels))}

    for idx, label in enumerate(labels):
        for arr in landmarks_data_math[label]:
            lm = np.array(arr, dtype=np.float32).reshape(-1, 3)

            # ✅ Asegurar que siempre tenga 42 puntos (2 manos * 21)
            if lm.shape[0] == 21:  
                # si solo hay 1 mano → rellenar con ceros la otra
                lm = np.vstack([lm, np.zeros((21, 3), dtype=np.float32)])
            elif lm.shape[0] > 42:
                lm = lm[:42]

            X.append(lm.flatten())
            y.append(idx)

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)

    model_math = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(len(labels), activation='softmax')
    ])
    model_math.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    model_math.fit(X, y, epochs=10, batch_size=16, verbose=0)

    return jsonify({'message': 'math model trained', 'classes': label_map_math}), 200



@math_bp.route('/predict', methods=['POST'])
def predict_landmarks_math():
    global model_math, label_map_math
    data = request.get_json()

    if not data or 'landmarks' not in data:
        return jsonify({'error': 'landmarks required'}), 400
    if model_math is None:
        return jsonify({'status': 'not_trained'}), 200

    lm = np.array(data['landmarks'], dtype=np.float32)

    # Cada mano = 21 puntos * 3 coords = 63 valores
    hand_size = 63  

    preds_all = []
    for i in range(0, len(lm), hand_size):
        hand_lm = lm[i:i+hand_size]
        if len(hand_lm) < hand_size:  # seguridad
            continue
        hand_lm = hand_lm.flatten().reshape(1, -1)

        preds = model_math.predict_on_batch(hand_lm)[0]
        idx = int(np.argmax(preds))
        predicted_math = label_map_math.get(idx, str(idx))
        confidence = float(preds[idx])
        preds_all.append({"prediction": predicted_math, "confidence": confidence})

    return jsonify({
        "status": "ok",
        "results": preds_all
    }), 200




@math_bp.route('/reset', methods=['POST'])
def reset_math():
    global landmarks_math_data, model_math, label_map_math
    landmarks_math_data = {}
    model_math = None
    label_map_math = {}
    return jsonify({'message': 'math memory cleared'}), 200
