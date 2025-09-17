from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf

app = Flask(__name__)
CORS(app)

# 🔹 Variables en memoria
landmarks_data = {}   # {"A": [[...], [...]], "E": [[...]]}
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
    if label not in landmarks_data:
        landmarks_data[label] = []
    landmarks_data[label].append(np.array(data['landmarks'], dtype=np.float32))
    return jsonify({'message': 'saved in memory', 'label': label, 'count': len(landmarks_data[label])}), 200

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
        tf.keras.layers.Dense(256, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(len(labels), activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(X, y, epochs=20, batch_size=16, verbose=1)

    return jsonify({'message': 'trained in memory', 'classes': label_map}), 200

@app.route('/predict_landmarks', methods=['POST'])
def predict_landmarks():
    global model, label_map
    data = request.get_json()

    if not data or 'landmarks' not in data:
        return jsonify({'error': 'landmarks required'}), 400

    if model is None:
        return jsonify({
            'prediction': None,
            'confidence': 0.0,
            'error': 'model not trained'
        }), 200  # ✅ ya no rompe con 400

    lm = np.array(data['landmarks'], dtype=np.float32).flatten().reshape(1, -1)
    preds = model.predict(lm)[0]
    idx = int(preds.argmax())
    return jsonify({
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
    # solo para desarrollo local
    app.run(host='0.0.0.0', port=5000)
