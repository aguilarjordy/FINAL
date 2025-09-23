// src/services/achievements.js
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// 📌 Registrar un logro (cuando se reconoce una vocal)
export async function recordAchievement(vocal, correct = true) {
  try {
    const res = await fetch(`${API}/api/achievements/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocal, correct })
    });
    return await res.json();
  } catch (err) {
    console.error("❌ Error al registrar logro:", err);
    return null;
  }
}

// 📌 Obtener progreso de logros desbloqueados
export async function getAchievementsProgress() {
  try {
    const res = await fetch(`${API}/api/achievements/progress`);
    return await res.json();
  } catch (err) {
    console.error("❌ Error al obtener progreso:", err);
    return null;
  }
}

// 📌 Reiniciar logros
export async function resetAchievements() {
  try {
    const res = await fetch(`${API}/api/achievements/reset`, {
      method: "POST"
    });
    return await res.json();
  } catch (err) {
    console.error("❌ Error al resetear logros:", err);
    return null;
  }
}
