import React, { useState, useContext } from "react";
import { toast } from "react-hot-toast";
import { AchievementContext } from "../context/AchievementContext";

const LOGROS = {
  vocal_a: "Logro A",
  vocal_e: "Logro E",
  vocal_i: "Logro I",
  vocal_o: "Logro O",
  vocal_u: "Logro U",
};

export default function Recognition() {
  const [vocal, setVocal] = useState("");
  const { updateAchievements } = useContext(AchievementContext);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handleRecognize = async () => {
    if (!vocal) {
      toast.error("Selecciona una vocal primero");
      return;
    }

    try {
      const payload = { vocal: vocal.toLowerCase(), correct: true };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/achievements/record`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await (res.headers.get("content-type")?.includes("application/json")
        ? res.json()
        : {});

      if (!res.ok) {
        console.error("Error registrando logro:", data);
        toast.error("No se pudo registrar el logro");
      } else {
        const newAchievements = data.new_achievements || [];
        const progress = data.progress || {};

        if (newAchievements.length > 0) {
          newAchievements.forEach((ach) => {
            const nombreBonito = LOGROS[ach] || ach;
            toast.success(`🏆 ¡Logro desbloqueado!: ${nombreBonito}`);
            speak(`Logro conseguido: ${nombreBonito}`);
          });
        }

        const unlocked = Object.keys(progress).filter((k) => progress[k]);
        updateAchievements(unlocked);
      }
    } catch (err) {
      console.error("❌ Error al registrar logro:", err);
      toast.error("Error de conexión con el servidor");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Reconocimiento de Vocales</h2>

      <select
        className="border p-2 rounded mb-2"
        value={vocal}
        onChange={(e) => setVocal(e.target.value)}
      >
        <option value="">Selecciona una vocal</option>
        <option value="A">A</option>
        <option value="E">E</option>
        <option value="I">I</option>
        <option value="O">O</option>
        <option value="U">U</option>
      </select>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        onClick={handleRecognize}
      >
        Reconocer
      </button>
    </div>
  );
}
