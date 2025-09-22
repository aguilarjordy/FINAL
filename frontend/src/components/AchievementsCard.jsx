import React, { useState, useEffect } from "react";
import { useAchievements } from "../context/AchievementsContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// 🔹 Misma lista que backend (achievements.py)
const ALL_ACHIEVEMENTS = [
  { id: "first_a", title: "Reconociste la vocal A" },
  { id: "first_e", title: "Reconociste la vocal E" },
  { id: "first_i", title: "Reconociste la vocal I" },
  { id: "first_o", title: "Reconociste la vocal O" },
  { id: "first_u", title: "Reconociste la vocal U" },
  { id: "master_vocals", title: "🏆 Logro Master: reconociste las 5 vocales por primera vez" },
];

export default function AchievementsCard() {
  const { achievements, updateAchievements, resetAchievements } = useAchievements();
  const [status, setStatus] = useState("");

  // 🔹 Al montar, traer progreso real del backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/api/achievements/progress`);
        const data = await res.json();

        if (data.unlocked) {
          updateAchievements(data.unlocked);
        }
      } catch (err) {
        console.error("❌ Error al obtener logros:", err.message);
      }
    };

    fetchProgress();
  }, [updateAchievements]);

  // 🔹 Reset de logros
  const handleResetAchievements = async () => {
    try {
      const res = await fetch(`${API_URL}/api/achievements/reset`, { method: "POST" });
      if (res.ok) {
        resetAchievements();
        setStatus("✅ Logros reiniciados");
      } else {
        setStatus("❌ Error al reiniciar");
      }
    } catch (err) {
      console.error("❌ Error al reiniciar logros:", err.message);
      setStatus("❌ Error de conexión");
    }
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="card">
      <div className="card-title">🎯 Logros</div>

      <ul className="achievements-list">
        {ALL_ACHIEVEMENTS.map((ach) => (
          <li
            key={ach.id}
            className={achievements.includes(ach.id) ? "unlocked" : "locked"}
          >
            {achievements.includes(ach.id) ? "✅" : "🔒"} {ach.title}
          </li>
        ))}
      </ul>

      <button className="button red" onClick={handleResetAchievements}>
        Reiniciar Logros
      </button>

      {status && <div className="small">{status}</div>}
    </div>
  );
}
