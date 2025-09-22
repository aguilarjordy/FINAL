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
    resetOperation,
  } = useOperations();

  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [collecting, setCollecting] = useState(null);

  const webcamRef1 = useRef(null);
  const canvasRef1 = useRef(null);
  const webcamRef2 = useRef(null);
  const canvasRef2 = useRef(null);

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

  // 🔹 Detección en tiempo real para ambas cámaras
  useEffect(() => {
    if (!model) return;
    const interval = setInterval(async () => {
      const cameras = [
        { webcam: webcamRef1.current, canvas: canvasRef1.current },
        { webcam: webcamRef2.current, canvas: canvasRef2.current },
      ];
      cameras.forEach(async ({ webcam, canvas }) => {
        if (webcam && canvas && webcam.video.readyState === 4) {
          const predictions = await model.estimateHands(webcam.video);
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawHand(predictions, ctx);
        }
      });
    }, 100);
    return () => clearInterval(interval);
  }, [model]);

  // 🔹 Obtener landmarks (ahora procesa ambas cámaras)
  const getLandmarks = async () => {
    const allPredictions = [];
    if (model && webcamRef1.current && webcamRef1.current.video.readyState === 4) {
      const predictions1 = await model.estimateHands(webcamRef1.current.video);
      allPredictions.push(...predictions1);
    }
    if (model && webcamRef2.current && webcamRef2.current.video.readyState === 4) {
      const predictions2 = await model.estimateHands(webcamRef2.current.video);
      allPredictions.push(...predictions2);
    }
    if (allPredictions.length > 0) {
      return allPredictions[0].landmarks.flat();
    }
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

  // 📌 Predecir seña actual y gestionar la secuencia
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
        <h2 className="operation-title">🧮 Operaciones Matemáticas con Señas</h2>
        <p className="operation-subtitle">
          Entrena el modelo recolectando muestras de números y operadores, y luego practica con tus manos.
        </p>

        {/* Sección de Cámaras */}
        <section className="panel-section">
          <h3 className="section-title">
            <span role="img" aria-label="camera">📷</span> Reconocimiento de Gestos
          </h3>
          <p className="section-subtitle">
            Asegúrate de que tus manos estén visibles en ambas cámaras.
          </p>
          <div className="cameras-container">
            {[1, 2].map((idx) => (
              <div key={idx} className="webcam-container">
                <Webcam
                  audio={false}
                  ref={idx === 1 ? webcamRef1 : webcamRef2}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                />
                <canvas
                  ref={idx === 1 ? canvasRef1 : canvasRef2}
                  width={videoConstraints.width}
                  height={videoConstraints.height}
                  className="overlay-canvas"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sección de Controles */}
        <section className="panel-section">
          <h3 className="section-title">
            <span role="img" aria-label="controls">⚙️</span> Controles de Operación
          </h3>
          <p className="section-subtitle">
            Utiliza los botones para recolectar muestras, entrenar el modelo y realizar tus operaciones.
          </p>
          
          {/* Botones de Recolección */}
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

          {/* Botones Principales */}
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={handleTrain} disabled={loading} className="btn-yellow">
              {loading ? "⏳ Entrenando..." : "📚 Entrenar"}
            </button>
            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-green"
            >
              {loading ? "⏳ Prediciendo..." : "📷 Reconocer Seña"}
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
        </section>

        {/* Sección de Visualización */}
        <section className="panel-section">
            <h3 className="section-title">
                <span role="img" aria-label="display">🖥️</span> Visualización
            </h3>
            <p className="section-subtitle">
                La operación actual se mostrará aquí a medida que reconozcas los gestos.
            </p>
            <div className="operation-display-card">
                <span className="operation-number">{firstNumber ?? "?"}</span>
                <span className="operation-operator">{operator ?? "?"}</span>
                <span className="operation-number">{secondNumber ?? "?"}</span>
                <span className="operation-operator">=</span>
                <span className="operation-number result-number">
                    {result ?? "?"}
                </span>
            </div>
        </section>
      </div>
    </div>
  );
};

export default OperationPanel;