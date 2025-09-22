// src/components/OperationPanel.jsx
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Hands, FilesetResolver } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { DrawingUtils } from "@mediapipe/drawing_utils";
import { useOperations } from "../context/OperationsContext";
import {
  predictOperation,
  calculateOperation,
} from "../services/operations";
import "../styles/operations.css";

const videoConstraints = {
  width: 320,
  height: 240,
  facingMode: "user",
};

const OperationPanel = () => {
  const {
    firstNumber,
    operator,
    secondNumber,
    result,
    setFirstNumber,
    setOperator,
    setSecondNumber,
    setResult,
    resetOperation,
  } = useOperations();

  const [loading, setLoading] = useState(false);
  const landmarksRef = useRef(null);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

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
        
        canvasCtx.translate(videoWidth, 0);
        canvasCtx.scale(-1, 1);
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          videoWidth,
          videoHeight
        );

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          landmarksRef.current = landmarks.flatMap((lm) => [lm.x, lm.y, lm.z]);
          
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
  }, []);

  const handlePredict = async () => {
    try {
      setLoading(true);
      const landmarks = landmarksRef.current;
      if (!landmarks) {
        alert("No se detectó ninguna mano");
        return;
      }
      
      const res = await predictOperation(landmarks);
      const prediction = res.data.prediction;

      if (firstNumber === null) {
        setFirstNumber(prediction);
      } else if (operator === null) {
        setOperator(prediction);
      } else if (secondNumber === null) {
        setSecondNumber(prediction);
      }
    } catch (err) {
      console.error("Error prediciendo:", err);
      alert("Error prediciendo seña");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (firstNumber === null || operator === null || secondNumber === null) {
      alert("Completa la operación antes de calcular");
      return;
    }
    try {
      setLoading(true);
      const res = await calculateOperation(firstNumber, operator, secondNumber);
      setResult(res.data.result);
    } catch (err) {
      console.error("Error calculando:", err);
      alert("Error en cálculo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card">
      <h3 className="section-title">
        <span role="img" aria-label="operations">🧠</span> Panel de Operaciones
      </h3>
      <p className="section-subtitle">
        Usa la cámara para reconocer tus señas y resolver operaciones aritméticas.
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
      </section>

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handlePredict}
          disabled={loading}
          className="btn-green"
        >
          {loading ? "⏳ Prediciendo..." : "📷 Reconocer seña"}
        </button>
        <button
          onClick={handleCalculate}
          disabled={loading || !firstNumber || !operator || !secondNumber}
          className="btn-blue"
        >
          {loading ? "⏳ Calculando..." : "🟰 Calcular"}
        </button>
        <button
          onClick={resetOperation}
          className="btn-gray"
        >
          Limpiar
        </button>
      </div>
      <div className="operation-display-card">
        <span className="operation-number">{firstNumber ?? "?"}</span>
        <span className="operation-operator">{operator ?? "?"}</span>
        <span className="operation-number">{secondNumber ?? "?"}</span>
        <span className="operation-operator">=</span>
        <span className="operation-number result-number">
          {result ?? "?"}
        </span>
      </div>
    </div>
  );
};

export default OperationPanel;