import React, { useState } from "react";
import { useTrainer } from "../context/TrainerContext";   // ✅ Estado global
import { useAchievements } from "../context/AchievementsContext"; // ✅ Logros
import { toast } from "react-hot-toast";
import { speak } from "../utils/speech";
import LOGROS from "../config/logros";

function Recognition() {
  const [prediction, setPrediction] = useState(null);
  const { isTrained, autoPredict } = useTrainer();
  const { updateAchievements } = useAchievements();

  async function handleRecognition(vocal) {
    if (!isTrained) {
      toast.error("⚠️ Primero debes entrenar el modelo.");
      speak("Primero debes entrenar el modelo");
      return;
    }

    // 👇 Usamos landmarks reales si existen
    const landmarks = window.currentLandmarks;

    if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 21) {
      toast.error("❌ No hay mano detectada en la cámara.");
      speak("No hay mano detectada en la cámara");
      return;
    }

    setPrediction(vocal);

    // 🔹 Mandamos landmarks reales al modelo
    await autoPredict(landmarks);

    // 🔹 Registrar logro en backend
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/achievements/record`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ achievement: `vocal_${vocal.toLowerCase()}` }),
        }
      );

      const data = await res.json();
      if (data?.new_achievements?.length > 0) {
        data.new_achievements.forEach((ach) => {
          const nombreBonito = LOGROS[ach] || ach;
          toast.success(`🏆 ¡Logro desbloqueado!: ${nombreBonito}`);
          speak(`Logro conseguido: ${nombreBonito}`);
        });

        updateAchievements(data.unlocked || []);
      }
    } catch (err) {
      console.error("❌ Error al registrar logro:", err);
    }
  }

  return (
    <div>
      <h2>Reconocimiento de Vocales</h2>
      <p>Predicción actual: {prediction || "ninguna"}</p>

      {/* Botones de prueba */}
      <div className="flex gap-2">
        {["A", "E", "I", "O", "U"].map((v) => (
          <button key={v} onClick={() => handleRecognition(v)}>
            Probar {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Recognition;
