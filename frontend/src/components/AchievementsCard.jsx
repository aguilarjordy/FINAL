// src/components/AchievementsCard.jsx
import React, { useState, useEffect } from "react";
import { useAchievements } from "../context/AchievementsContext";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AchievementsCard() {
  const { achievements, updateAchievements, resetAchievements } = useAchievements();
  const [status, setStatus] = useState("");
  const { t } = useTranslation();

  const ALL_ACHIEVEMENTS = [
    { id: "first_a", title: t("achievements.first_a") },
    { id: "first_e", title: t("achievements.first_e") },
    { id: "first_i", title: t("achievements.first_i") },
    { id: "first_o", title: t("achievements.first_o") },
    { id: "first_u", title: t("achievements.first_u") },
    { id: "five_predictions", title: t("achievements.five_predictions") },
    { id: "master_vocals", title: t("achievements.master_vocals") },
  ];

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/api/achievements/progress`);
        const data = await res.json();
        if (data.unlocked) updateAchievements(data.unlocked);
      } catch (err) {
        console.error("❌ Error al obtener logros:", err.message);
      }
    };
    fetchProgress();
  }, [updateAchievements]);

  const handleResetAchievements = async () => {
    try {
      const res = await fetch(`${API_URL}/api/achievements/reset`, { method: "POST" });
      if (res.ok) {
        resetAchievements();
        setStatus(`✅ ${t("achievements.reset_success")}`);
      } else {
        setStatus(`❌ ${t("achievements.reset_error")}`);
      }
    } catch (err) {
      console.error("❌ Error al reiniciar logros:", err.message);
      setStatus(`❌ ${t("achievements.connection_error")}`);
    }
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="card" style={{ fontSize: "var(--app-font-size)" }}>
      <div className="card-title">🎯 {t("achievements.title")}</div>

      <ul className="achievements-list">
        {ALL_ACHIEVEMENTS.map((ach) => (
          <li key={ach.id} className={achievements.includes(ach.id) ? "unlocked" : "locked"}>
            {achievements.includes(ach.id) ? "✅" : "🔒"} {ach.title}
          </li>
        ))}
      </ul>

      <button className="button red" onClick={handleResetAchievements}>
        {t("achievements.reset_button")}
      </button>

      {status && <div className="small">{status}</div>}
    </div>
  );
}
