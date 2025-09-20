// src/services/achievements.js
const API = import.meta.env.VITE_API_BASE_URL;

export async function recordAchievement(vocal, correct = true) {
  try {
    const res = await fetch(`${API}/api/achievements/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocal, correct })
    });
    return await res.json();
  } catch (err) {
    console.error("Error al comunicar con el backend:", err);
    return null;
  }
}
