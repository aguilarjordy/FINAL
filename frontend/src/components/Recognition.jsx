import { useState } from "react";
import { recordAchievement } from "../services/achievements";
import { useTranslation } from "react-i18next";

function Recognition() {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState(null);

  async function handleRecognition(pred) {
    setPrediction(pred);

    const data = await recordAchievement(pred, true);
    if (data?.new_achievements?.length > 0) {
      data.new_achievements.forEach(l => {
        alert(`${t("recognition.achievement_unlocked")}: ${l.title}\n${l.desc}`);
      });
    }
  }

  return (
    <div>
      <h2>{t("recognition.title")}</h2>
      <p>
        {t("recognition.current_prediction")}: {prediction || t("recognition.none")}
      </p>

      {/* Botones de prueba */}
      <div className="flex gap-2">
        {["A", "E", "I", "O", "U"].map(v => (
          <button key={v} onClick={() => handleRecognition(v)}>
            {t("recognition.test_button")} {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Recognition;
