// src/components/OperationTrainer.jsx
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Hands, FilesetResolver } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { DrawingUtils } from "@mediapipe/drawing_utils";
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
  const [collecting, setCollecting] = useState(null);
  const [progress, setProgress] = useState(0);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const countsRef = useRef({});

  useEffect(() => {
    if (!webcamRef.current) return;

    const setupMediaPipe = async () => {
      const filesetResolver = await FilesetResolver.forHands(
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646/wasm"
      );
      
      const hands = new Hands(filesetResolver);

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const drawingUtils = new DrawingUtils(canvasRef.current.getContext("2d"));

      hands.onResults((results) => {
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        const canvasCtx = canvasRef.current.getContext("2d");

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          videoWidth,
          videoHeight
        );

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];

          // 🚀 Recolecta la muestra si el estado de recolección está activo
          if (collecting) {
            const count = countsRef.current[collecting] || 0;
            if (count < 100) {
              const allLandmarks = landmarks.flatMap((lm) => [lm.x, lm.y, lm.z]);
              uploadOperationSample(collecting, allLandmarks);
              countsRef.current[collecting] = count + 1;
              setProgress(count + 1);
            } else {
              setCollecting(null);
              alert(`✅ Se recolectaron 100 muestras para ${collecting}`);
              countsRef.current[collecting] = 0; // Reinicia el contador para futuros usos
            }
          }

          // ✅ Dibuja la mano en el canvas
          drawingUtils.drawConnectors(canvasCtx, landmarks, Hands.CONNECTIONS, {
            color: "#4ade80",
            lineWidth: 2,
          });
          drawingUtils.drawLandmarks(canvasCtx, landmarks, {
            color: "#4ade80",
            lineWidth: 2,
            radius: 4,
          });
        }
        canvasCtx.restore();
      });

      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 320,
        height: 240,
      });
      camera.start();
    };

    setupMediaPipe();
  }, [collecting]);

  const handleCollect = (label) => {
    setProgress(0);
    setCollecting(label);
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