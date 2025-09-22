// src/components/Recognition.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTrainer } from "../context/TrainerContext";
import { useAchievements } from "../context/AchievementsContext";
import { toast } from "react-hot-toast";
import { speak } from "../utils/speech";
import LOGROS from "../config/logros";

function Recognition() {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState(null);
  const { isTrained, autoPredict } = useTrainer();
  const { updateAchievements } = useAchievements();

  async function handleRecognition(vocal) {
    if (!isTrained) {
      toast.error("⚠️ Primero debes entrenar el modelo.");
      speak("Primero debes entrenar el modelo");
      return;
    }

    const landmarks = window.currentLandmarks;
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 21) {
      toast.error("❌ No hay mano detectada en la cámara.");
      speak("No hay mano detectada en la cámara");
      return;
    }

    setPrediction(vocal);
    await autoPredict(landmarks);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/achievements/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievement: `vocal_${vocal.toLowerCase()}` }),
      });

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
      <h2>{t("Reconocimiento de Vocales")}</h2>
      <p>
        {t("Predicción actual")}: {prediction || t("ninguna")}
      </p>

      <div className="flex gap-2">
        {["A", "E", "I", "O", "U"].map((v) => (
          <button key={v} onClick={() => handleRecognition(v)}>
            {t("Probar")} {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Recognition;
