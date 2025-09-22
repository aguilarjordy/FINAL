import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose"; 
import "@tensorflow/tfjs"; 
import { useOperations } from "../context/OperationsContext";
import { uploadOperation, trainOperations, predictOperation, calculateOperation } from "../services/operations";

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
  const [collecting, setCollecting] = useState(null); // etiqueta activa para recolectar

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // 🔹 Cargar modelo Handpose
  useEffect(() => {
    const loadModel = async () => {
      const net = await handpose.load();
      setModel(net);
      console.log("✅ Modelo Handpose cargado");
    };
    loadModel();
  }, []);

  // 🔹 Dibujar landmarks en canvas
  const drawHand = (predictions, ctx) => {
    if (!predictions.length) return;
    predictions.forEach(pred => {
      const landmarks = pred.landmarks;
      for (let i = 0; i < landmarks.length; i++) {
        const [x, y] = landmarks[i];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "lime";
        ctx.fill();
      }
    });
  };

  // 🔹 Detección en tiempo real
  useEffect(() => {
    if (!model) return;
    const interval = setInterval(async () => {
      if (webcamRef.current && canvasRef.current) {
        const predictions = await model.estimateHands(webcamRef.current.video);
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawHand(predictions, ctx);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [model]);

  // 🔹 Obtener landmarks actuales
  const getLandmarks = async () => {
    if (!model || !webcamRef.current) return null;
    const predictions = await model.estimateHands(webcamRef.current.video);
    if (predictions.length > 0) {
      return predictions[0].landmarks.flat();
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
      await uploadOperation(label, landmarks);
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
      const res = await trainOperations();
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
        else if (operator && secondNumber === null) setSecondNumber(Number(prediction));
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
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">🧮 Operaciones con Señas</h2>

      {/* Cámara con overlay */}
      <div className="relative flex justify-center mb-4">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-xl shadow-md"
        />
        <canvas
          ref={canvasRef}
          width={videoConstraints.width}
          height={videoConstraints.height}
          className="absolute top-0 left-0"
        />
      </div>

      {/* Operación en progreso */}
      <div className="text-2xl font-bold mb-4">
        {firstNumber ?? "?"} {operator ?? "?"} {secondNumber ?? "?"}
      </div>

      {/* Botones de recolección */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">📌 Recolectar muestras</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {[..."0123456789", "+", "-", "*", "/"].map((lbl) => (
            <button
              key={lbl}
              onClick={() => handleCollect(lbl)}
              disabled={!!collecting}
              className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
            >
              {collecting === lbl ? "⏳..." : lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Botones principales */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handleTrain}
          disabled={loading}
          className="bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Entrenando..." : "📚 Entrenar"}
        </button>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Prediciendo..." : "📷 Reconocer seña"}
        </button>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Calculando..." : "🟰 Calcular"}
        </button>
      </div>

      {/* Resultado final */}
      {result !== null && (
        <h3 className="mt-4 text-lg font-semibold">
          Resultado: {result}
        </h3>
      )}
    </div>
  );
};

export default OperationPanel;
