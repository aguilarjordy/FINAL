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

  // 📌 El resto de tu lógica para manejar la detección de señas
  // ...

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          🧮 Panel de Operaciones
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Usa la cámara para reconocer tus señas y resolver operaciones aritméticas.
        </p>
        <section className="flex flex-col items-center">
          {/* 📷 Cámara */}
          <div className="relative w-full max-w-sm mb-6 rounded-lg overflow-hidden shadow-md">
            <Webcam
              ref={webcamRef1}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full"
            />
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
