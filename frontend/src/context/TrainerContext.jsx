import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { speak } from "../utils/speech";
import LOGROS from "../config/logros";

const TrainerContext = createContext();
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const TrainerProvider = ({ children }) => {
  const [status, setStatus] = useState("Esperando...");
  const [prediction, setPrediction] = useState(null);
  const [counts, setCounts] = useState({});
  const [progress, setProgress] = useState(0);
  const [isTrained, setIsTrained] = useState(false);

  // ✅ referencia que persiste entre renders
  const isTrainedRef = useRef(false);

  // 🔹 Traer conteos desde el backend
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/count`);
      const j = await res.json();
      setCounts(j || {});
    } catch (e) {
      console.error("❌ Error al traer conteos:", e);
    }
  }, []);

  // 🔹 Predicción automática
  const autoPredict = useCallback(async (landmarks) => {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 21)
      return;

    try {
      const res = await fetch(`${API_URL}/predict_landmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landmarks }),
      });

      const data = await res.json();

      if (data.status === "not_trained") {
        setStatus("Modelo no entrenado todavía ⚠️");
        return;
      }

      if (data.status === "ok") {
        const result = `${data.prediction} (${(data.confidence * 100).toFixed(
          1
        )}%)`;
        setPrediction(result);
        setStatus("Prediciendo...");

        // 🎉 Notificar logros nuevos
        if (data.new_achievements?.length > 0) {
          data.new_achievements.forEach((ach) => {
            const nombreBonito = LOGROS[ach] || ach;
            toast.success(`🎉 Logro desbloqueado: ${nombreBonito}`);
            speak(`Logro conseguido: ${nombreBonito}`);
          });
        }
      }
    } catch (e) {
      console.error("❌ Error en predicción:", e.message);
    }
  }, []);

  // 🔹 Entrenar modelo
  const handleTrain = useCallback(async () => {
    setStatus("Entrenando...");
    speak("Entrenando modelo, espere por favor");
    try {
      const res = await fetch(`${API_URL}/train_landmarks`, { method: "POST" });
      const j = await res.json();
      if (res.ok) {
        setStatus("Entrenado correctamente");
        speak("Modelo entrenado correctamente");
        setIsTrained(true);
        isTrainedRef.current = true; // ✅ aseguramos que la referencia se actualice

        if (window.currentLandmarks && window.currentLandmarks.length === 21) {
          autoPredict(window.currentLandmarks);
        }
      } else {
        setStatus("Error: " + (j.error || "Error en entrenamiento"));
        setIsTrained(false);
        isTrainedRef.current = false;
      }
    } catch (e) {
      setStatus("Error: " + e.message);
      setIsTrained(false);
      isTrainedRef.current = false;
    }
  }, [autoPredict]);

  // 🔹 Resetear modelo/datos
  const handleReset = useCallback(async () => {
    setStatus("Reiniciando datos...");
    try {
      const res = await fetch(`${API_URL}/reset`, { method: "POST" });
      if (res.ok) {
        setCounts({});
        setPrediction(null);
        setStatus("Datos eliminados");
        setIsTrained(false);
        isTrainedRef.current = false; // ✅ también reseteamos la referencia
        toast("⚠️ Se reiniciaron los datos de entrenamiento");
      }
    } catch (e) {
      setStatus("Error al reiniciar: " + e.message);
      setIsTrained(false);
      isTrainedRef.current = false;
    }
  }, []);

  return (
    <TrainerContext.Provider
      value={{
        status,
        prediction,
        counts,
        progress,
        setProgress,
        fetchCounts,
        autoPredict,
        handleTrain,
        handleReset,
        isTrained,     // 👉 estado reactivo (para UI)
        isTrainedRef,  // 👉 referencia persistente (para onResults en App.jsx)
      }}
    >
      {children}
    </TrainerContext.Provider>
  );
};

export const useTrainer = () => {
  const context = useContext(TrainerContext);
  if (!context) {
    throw new Error("useTrainer debe usarse dentro de un TrainerProvider");
  }
  return context;
};
