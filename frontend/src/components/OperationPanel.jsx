// src/components/OperationPanel.jsx
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
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
  const [model, setModel] = useState(null);

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
    if (predictions.length > 0) {
      // 📌 Unir los landmarks de todas las manos en un solo array
      const allLandmarks = predictions.flatMap(prediction => prediction.landmarks.flat());
      return allLandmarks;
    }
    return null;
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      const landmarks = await getLandmarks();
      if (!landmarks || landmarks.length === 0) {
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
              width={videoConstraints.width}
              height={videoConstraints.height}
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