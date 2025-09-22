// src/components/OperationPanel.jsx
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
import { useOperations } from "../context/OperationsContext";
import {
  uploadOperationSample,
  trainOperationModel,
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
  } = useOperations();

  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [collecting, setCollecting] = useState(null);

  const webcamRef1 = useRef(null);
  const canvasRef1 = useRef(null);

  // 🔹 Cargar modelo Handpose
  useEffect(() => {
    const loadModel = async () => {
      const net = await handpose.load();
      setModel(net);
      console.log("✅ Modelo Handpose cargado");
    };
    loadModel();
  }, []);

  // 🔹 Dibujar landmarks y esqueleto
  const drawHand = (predictions, ctx) => {
    if (!predictions.length) return;
    predictions.forEach((pred) => {
      const landmarks = pred.landmarks;

      // puntos
      landmarks.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "lime";
        ctx.fill();
      });

      // esqueleto
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

  // 🔹 Detección en tiempo real para la cámara
  useEffect(() => {
    if (!model) return;
    const interval = setInterval(async () => {
      const webcam = webcamRef1.current;
      const canvas = canvasRef1.current;
      if (webcam && canvas) {
        const predictions = await model.estimateHands(webcam.video);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHand(predictions, ctx);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [model]);

  // 🔹 Obtener landmarks de la cámara
  const getLandmarks = async () => {
    if (!model || !webcamRef1.current) return null;
    const predictions = await model.estimateHands(webcamRef1.current.video);
    if (predictions.length > 0) return predictions[0].landmarks.flat();
    return null;
  };

  // 📌 Recolectar muestras
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

  // 📌 Entrenar modelo
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

  // 📌 Predecir seña actual
  const handlePredict = async () => {
    try {
      setLoading(true);
      const landmarks = await getLandmarks();
      if (!landmarks) {
        alert("No se detectó la mano");
        return;
      }
      const res = await predictOperation(landmarks);
      const prediction = res.data.prediction;
      if (!isNaN(prediction)) {
        if (firstNumber === null) setFirstNumber(Number(prediction));
        else if (operator && secondNumber === null)
          setSecondNumber(Number(prediction));
      } else {
        setOperator(prediction);
      }
    } catch (err) {
      console.error("Error prediciendo:", err);
      alert("Error prediciendo seña");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Calcular operación
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
    <div className="operation-panel">
      <div className="content-card">
        <h2 className="operation-title">🧮 Operaciones Aritméticas con Señas</h2>
        <p className="operation-subtitle">
          Entrena el modelo recolectando muestras de números y operadores, y luego practica sumas, restas, multiplicaciones y divisiones con tus manos.
        </p>

        {/* Sección de Entrenamiento */}
        <section className="panel-section">
          <h3 className="section-title">
            <span role="img" aria-label="training">📚</span> Entrenamiento
          </h3>
          <p className="section-subtitle">
            Guarda muestras de tus señas para números y operadores. Cuando tengas suficientes ejemplos, entrena el modelo.
          </p>
          <div className="cameras-container single-camera">
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef1}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
              <canvas
                ref={canvasRef1}
                width={videoConstraints.width}
                height={videoConstraints.height}
                className="overlay-canvas"
              />
            </div>
          </div>
        </section>

        {/* Sección de Paneles de Operaciones */}
        <section className="panel-section">
          <h3 className="section-title">
            <span role="img" aria-label="operation">🧠</span> Panel de Operaciones
          </h3>
          <p className="section-subtitle">
            Selecciona el tipo (número u operador), escribe el valor, y captura gestos para entrenar el modelo.
          </p>
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

          <div className="flex justify-center gap-4 mt-4">
            <button onClick={handleTrain} disabled={loading} className="btn-yellow">
              {loading ? "⏳ Entrenando..." : "📚 Entrenar"}
            </button>
            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-green"
            >
              {loading ? "⏳ Prediciendo..." : "📷 Reconocer seña"}
            </button>
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="btn-blue"
            >
              {loading ? "⏳ Calculando..." : "🟰 Calcular"}
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

          {result !== null && (
            <div className="result-box">
              <h3 className="operation-result">Resultado: {result}</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OperationPanel;