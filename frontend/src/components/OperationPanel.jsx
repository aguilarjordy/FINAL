import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose"; // Modelo de manos
import "@tensorflow/tfjs"; // Necesario para handpose
import { useOperations } from "../context/OperationsContext";
import { calculateOperation, predictOperation } from "../services/operations";

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
  const webcamRef = useRef(null);

  // 🔹 Cargar modelo de MediaPipe/Handpose
  useEffect(() => {
    const loadModel = async () => {
      const net = await handpose.load();
      setModel(net);
      console.log("✅ Modelo de manos cargado");
    };
    loadModel();
  }, []);

  // 🔹 Detectar landmarks
  const detectLandmarks = async () => {
    if (!model || !webcamRef.current) return null;
    const predictions = await model.estimateHands(webcamRef.current.video);

    if (predictions.length > 0) {
      // Extraer landmarks en array plano
      const landmarks = predictions[0].landmarks.flat();
      return landmarks;
    }
    return null;
  };

  // 🔹 Predicción con señas
  const handlePredict = async () => {
    try {
      setLoading(true);
      const landmarks = await detectLandmarks();

      if (!landmarks) {
        alert("No se detectaron manos, intenta de nuevo");
        return;
      }

      const res = await predictOperation(landmarks);
      const { type, value } = res.data;

      if (type === "number") {
        if (firstNumber === null) {
          setFirstNumber(Number(value));
        } else if (operator !== null && secondNumber === null) {
          setSecondNumber(Number(value));
        }
      } else if (type === "operator") {
        setOperator(value);
      }
    } catch (error) {
      console.error("Error en predicción:", error);
      alert("No se pudo reconocer la seña");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Calcular en backend
  const handleCalculate = async () => {
    if (firstNumber === null || operator === null || secondNumber === null) {
      alert("Completa la operación");
      return;
    }

    try {
      setLoading(true);
      const res = await calculateOperation(firstNumber, operator, secondNumber);
      setResult(res.data.result);
    } catch (error) {
      console.error("Error al calcular:", error);
      alert("Error al calcular la operación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">🧮 Panel de Operaciones</h2>

      {/* Vista de cámara */}
      <div className="flex justify-center mb-4">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-xl shadow-md"
        />
      </div>

      {/* Operación en progreso */}
      <div className="text-2xl font-bold mb-4">
        {firstNumber ?? "?"} {operator ?? "?"} {secondNumber ?? "?"}
      </div>

      {/* Botones */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Reconociendo..." : "📷 Reconocer seña"}
        </button>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Calculando..." : "🟰 Calcular"}
        </button>
      </div>

      {/* Resultado */}
      {result !== null && (
        <h3 className="mt-4 text-lg font-semibold">
          Resultado: {result}
        </h3>
      )}
    </div>
  );
};

export default OperationPanel;
