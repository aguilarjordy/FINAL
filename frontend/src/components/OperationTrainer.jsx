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
  const [progress, setProgress] = useState(0);

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
      // Dibujar puntos más grandes y líneas más gruesas
      landmarks.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI); // Puntos de radio 8
        ctx.fillStyle = "#34d399"; // Color verde neón
        ctx.fill();
      });
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
      ];
      ctx.strokeStyle = "#4ade80"; // Color verde claro
      ctx.lineWidth = 4; // Líneas de grosor 4
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
    if (predictions.length > 0) {
      const allLandmarks = predictions.flatMap(prediction => prediction.landmarks.flat());
      return allLandmarks;
    }
    return null;
  };

  const handleCollect = async (label) => {
    try {
      setCollecting(label);
      setProgress(0);
      for (let i = 0; i < 100; i++) {
        const landmarks = await getLandmarks();
        if (!landmarks) {
          alert("No se detectó la mano, deteniendo recolección.");
          break;
        }
        await uploadOperationSample(label, landmarks);
        setProgress(i + 1);
      }
      alert(`✅ Se recolectaron 100 muestras para ${label}`);
    } catch (err) {
      console.error("Error recolectando:", err);
      alert("Error recolectando muestras");
    } finally {
      setCollecting(null);
      setProgress(0);
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
    <div className="content-card">
      <h3 className="section-title">
        <span role="img" aria-label="training">📚</span> Recolección de Muestras
      </h3>
      <p className="section-subtitle">
        Guarda una muestra para cada número y operador. Apunta la(s) mano(s) a la cámara y presiona el botón.
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
              {collecting === lbl ? `Recolectando... (${progress}/100)` : lbl}
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-4">
        <button onClick={handleTrain} disabled={loading} className="btn-yellow">
          {loading ? "⏳ Entrenando..." : "📚 Entrenar Modelo"}
        </button>
      </div>
    </div>
  );
};

export default OperationTrainer;