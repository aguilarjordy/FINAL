import { useState } from "react";
import { recordAchievement } from "../services/achievements";

function Recognition() {
  const [prediction, setPrediction] = useState(null);

  async function handleRecognition(pred) {
    setPrediction(pred);

    const data = await recordAchievement(pred, true);
    if (data?.new_achievements?.length > 0) {
      data.new_achievements.forEach(l => {
        alert(`🏆 ¡Logro desbloqueado!: ${l.title}\n${l.desc}`);
      });
    }
  }

  return (
    <div>
      <h2>Reconocimiento de Vocales</h2>
      <p>Predicción actual: {prediction || "ninguna"}</p>

      {/* Botones de prueba */}
      <div className="flex gap-2">
        {["A", "E", "I", "O", "U"].map(v => (
          <button key={v} onClick={() => handleRecognition(v)}>
            Probar {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Recognition;
