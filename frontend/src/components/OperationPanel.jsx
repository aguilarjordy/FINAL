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

  // 🔹 Dibujar landmarks
  const drawHand = (predictions, ctx) => {
    if (!predictions.length) return;
    predictions.forEach((pred) => {
      pred.landmarks.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "lime";
        ctx.fill();
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
        if (webcam && canvas) {
          const predictions = await model.estimateHands(webcam.video);
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawHand(predictions, ctx);
        }
      });
    }, 100);
    return () => clearInterval(interval);
  }, [model]);

  // 🔹 Obtener landmarks (de la cámara 1 por defecto)
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
      <h2 className="operation-title">🧮 Operaciones con Señas</h2>
      <p className="operation-subtitle">
        Entrena, reconoce y calcula operaciones usando gestos de la mano.
      </p>

      {/* Contenedor de cámaras */}
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

      {/* Operación en progreso */}
      <div className="operation-display">
        {firstNumber ?? "?"} {operator ?? "?"} {secondNumber ?? "?"}
      </div>

      {/* Botones de recolección */}
      <div>
        <h3 className="font-semibold mb-2">📌 Recolectar muestras</h3>
        <div className="flex flex-wrap justify-center gap-2">
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
      </div>

      {/* Botones principales */}
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

      {/* Resultado final */}
      {result !== null && (
        <h3 className="operation-result">Resultado: {result}</h3>
      )}
    </div>
  );
};

export default OperationPanel;
