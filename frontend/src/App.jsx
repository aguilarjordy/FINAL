import React, { useRef, useEffect, useState } from "react";

const VOCALS = ["A", "E", "I", "O", "U"];
const MAX_PER_LABEL = 100;
const API = "https://final-8mv8.onrender.com"; // tu backend en Render

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState("Cargando cámara...");
  const collectingRef = useRef(null);
  const warnedNotTrained = useRef(false);

  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("Cámara lista ✅");
    }
    setupCamera();
  }, []);

  async function sendLandmarks(label, landmarks) {
    try {
      const res = await fetch(`${API}/upload_landmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, landmarks }),
      });
      const data = await res.json();
      console.log("📩 Guardado:", data);
      await fetchCounts();
    } catch (err) {
      console.error("❌ Error guardando landmarks:", err);
    }
  }

  async function fetchCounts() {
    try {
      const res = await fetch(`${API}/count`);
      const data = await res.json();
      setCounts(data);
    } catch (err) {
      console.error("❌ Error obteniendo counts:", err);
    }
  }

  async function trainModel() {
    try {
      const res = await fetch(`${API}/train_landmarks`, { method: "POST" });
      const data = await res.json();
      console.log("🤖 Entrenamiento:", data);
      if (data.message) {
        setStatus("Modelo entrenado 🎉");
        warnedNotTrained.current = false; // reset para próximas sesiones
      }
    } catch (err) {
      console.error("❌ Error entrenando modelo:", err);
    }
  }

  async function predict(landmarks) {
    try {
      const res = await fetch(`${API}/predict_landmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landmarks }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (
          err.error === "model not trained" &&
          !warnedNotTrained.current
        ) {
          console.warn("⚠️ Modelo no entrenado (se muestra solo una vez)");
          warnedNotTrained.current = true;
        }
        return; // no spamear en consola
      }

      const data = await res.json();
      console.log("✅ Predicción:", data);
    } catch (error) {
      console.error("❌ Error de red en predicción:", error);
    }
  }

  function startCollecting(vocal) {
    collectingRef.current = vocal;
    setStatus(`Recolectando datos de ${vocal}...`);
  }

  function stopCollecting() {
    collectingRef.current = null;
    setStatus("Detenido ⏸️");
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Entrenador de Vocales ✋🎤</h1>
      <p>{status}</p>

      <video ref={videoRef} className="border" width="400" height="300" />
      <canvas ref={canvasRef} width="400" height="300" className="border" />

      <div className="mt-4 flex gap-2">
        {VOCALS.map((v) => (
          <button
            key={v}
            onClick={() => startCollecting(v)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Recolectar {v} ({counts[v] || 0})
          </button>
        ))}
        <button
          onClick={stopCollecting}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Detener
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={trainModel}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Entrenar
        </button>
        <button
          onClick={fetchCounts}
          className="px-3 py-1 bg-purple-500 text-white rounded"
        >
          Ver Conteos
        </button>
      </div>
    </div>
  );
}
