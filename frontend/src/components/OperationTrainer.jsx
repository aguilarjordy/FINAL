import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
import { collectSample, trainOperationModel } from "../services/operations";

const videoConstraints = {
  width: 320,
  height: 240,
  facingMode: "user",
};

export default function OperationTrainer() {
  const [type, setType] = useState("number");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const webcamRef = useRef(null);

  // Cargar modelo de manos
  useEffect(() => {
    const loadModel = async () => {
      const net = await handpose.load();
      setModel(net);
      console.log("✅ Modelo de manos cargado");
    };
    loadModel();
  }, []);

  // Detectar landmarks
  const detectLandmarks = async () => {
    if (!model || !webcamRef.current) return null;
    const predictions = await model.estimateHands(webcamRef.current.video);
    if (predictions.length > 0) {
      return predictions[0].landmarks.flat();
    }
    return null;
  };

  // Guardar muestra
  const handleSave = async () => {
    if (!value.trim()) {
      alert("Escribe un valor válido (ej: 5, +, -, *, /)");
      return;
    }

    try {
      setLoading(true);
      const landmarks = await detectLandmarks();
      if (!landmarks) {
        alert("No se detectaron manos en la cámara");
        return;
      }

      const res = await collectSample(`${type}:${value}`, landmarks);
      alert(res.data.message || `✅ Muestra de "${value}" guardada`);
    } catch (err) {
      console.error("Error al guardar muestra:", err);
      alert("Error al guardar muestra");
    } finally {
      setLoading(false);
    }
  };

  // Entrenar modelo
  const handleTrain = async () => {
    try {
      setLoading(true);
      const res = await trainOperationModel();
      alert("🎉 Modelo entrenado con clases: " + JSON.stringify(res.data.classes));
    } catch (err) {
      console.error("Error al entrenar:", err);
      alert("Error al entrenar modelo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">🎓 Entrenador de Operaciones</h1>
      <p className="text-gray-600 mb-4">
        Selecciona el tipo (número u operador), escribe el valor, y captura gestos para entrenar el modelo.
      </p>

      {/* Cámara */}
      <div className="flex justify-center mb-4">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-xl shadow-md"
        />
      </div>

      {/* Selector de tipo y valor */}
      <div className="flex justify-center gap-2 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="number">Número</option>
          <option value="operator">Operador</option>
        </select>

        <input
          type="text"
          placeholder="Ejemplo: 5 o +"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border px-3 py-2 rounded-lg w-32"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Guardando..." : "📷 Guardar muestra"}
        </button>

        <button
          onClick={handleTrain}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Entrenando..." : "🤖 Entrenar modelo"}
        </button>
      </div>
    </div>
  );
}
