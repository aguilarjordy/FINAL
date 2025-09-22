// src/components/OperationTrainer.jsx
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
import {
  uploadOperationSample,
  trainOperationModel,
} from "../services/operations";
import "../styles/operations.css";

const videoConstraints = {
  width: 320,
  height: 240,
  facingMode: "user",
};

const OperationTrainer = () => {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [collecting, setCollecting] = useState(null);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      const net = await handpose.load();
      setModel(net);
      console.log("✅ Modelo Handpose cargado");
    };
    loadModel();
  }, []);

  const drawHand = (predictions, ctx) => {
    if (!predictions.length) return;
    predictions.forEach((pred) => {
      const landmarks = pred.landmarks;
      landmarks.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "lime";
        ctx.fill();
      });
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
      ];
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      connections.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[i][0], landmarks[i][1]);
        ctx.lineTo(landmarks[j][0], landmarks[j][1]);
        ctx.stroke();
      });
    });
  };

  useEffect(() => {
    if (!model) return;
    const interval = setInterval(async () => {
      const webcam = webcamRef.current;
      const canvas = canvasRef.current;
      if (webcam && canvas && webcam.video.readyState === 4) {
        const predictions = await model.estimateHands(webcam.video);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHand(predictions, ctx);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [model]);

  const getLandmarks = async () => {
    if (!model || !webcamRef.current) return null;
    const predictions = await model.estimateHands(webcamRef.current.video);
    if (predictions.length > 0) return predictions[0].landmarks.flat();
    return null;
  };

  const handleCollect = async (label) => {
    try {
      setCollecting(label);
      const landmarks = await getLandmarks();
      if (!landmarks) {
        alert("No se detectó la mano");
        return;
      }
      await uploadOperationSample(label, landmarks);
      alert(`✅ Muestra guardada para ${label}`);
    } catch (err) {
      console.error("Error recolectando:", err);
    } finally {
      setCollecting(null);
    }
  };

  const handleTrain = async () => {
    try {
      setLoading(true);
      const res = await trainOperationModel();
      alert("✅ Modelo entrenado: " + JSON.stringify(res.data.classes));
    } catch (err) {
      console.error("Error entrenando:", err);
      alert("Error entrenando modelo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operation-panel">
      <div className="content-card">
        <h3 className="section-title">
          <span role="img" aria-label="training">📚</span> Recolección de Muestras
        </h3>
        <p className="section-subtitle">
          Guarda una muestra para cada número y operador. Apunta la mano a la cámara y presiona el botón.
        </p>

        <section className="panel-section">
          <div className="cameras-container">
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
              <canvas
                ref={canvasRef}
                width={videoConstraints.width}
                height={videoConstraints.height}
                className="overlay-canvas"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {[..."0123456789", "+", "-", "*", "/"].map((lbl) => (
              <button
                key={lbl}
                onClick={() => handleCollect(lbl)}
                disabled={!!collecting}
                className="btn-gray"
              >
                {collecting === lbl ? "⏳..." : lbl}
              </button>
            ))}
          </div>
        </section>

        <div className="flex justify-center mt-4">
          <button onClick={handleTrain} disabled={loading} className="btn-yellow">
            {loading ? "⏳ Entrenando..." : "📚 Entrenar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperationTrainer;