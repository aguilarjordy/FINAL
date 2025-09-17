from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,DELETE"
    return response

# 🔹 Variables globales en memoria
landmarks_data = {}
model = None
label_map = {}

@app.route('/')
def home():
    return jsonify({"status": "backend running 🚀"})

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

    # 🔹 Reemplazar modelo anterior para evitar acumulación de capas
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(len(labels), activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    # 🔹 Menos épocas = entrenamiento más rápido
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

    # 🔹 predict_on_batch es más rápido
    preds = model.predict_on_batch(lm)[0]
    idx = int(np.argmax(preds))

    return jsonify({
        'status': 'ok',
        'prediction': label_map.get(idx, str(idx)),
        'confidence': float(preds[idx])
    }), 200

@app.route('/reset', methods=['POST'])
def reset():
    global landmarks_data, model, label_map
    landmarks_data = {}
    model = None
    label_map = {}
    return jsonify({'message': 'memory cleared'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
