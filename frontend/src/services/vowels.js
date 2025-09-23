const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Subir landmarks de una vocal
export async function uploadVowel(label, landmarks) {
  const res = await fetch(`${API_URL}/upload_landmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, landmarks }),
  });
  return res.json();
}

// Entrenar modelo de vocales
export async function trainVowels() {
  const res = await fetch(`${API_URL}/train_landmarks`, {
    method: "POST",
  });
  return res.json();
}

// Predecir una vocal
export async function predictVowel(landmarks) {
  const res = await fetch(`${API_URL}/predict_landmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks }),
  });
  return res.json();
}

// Obtener conteos de muestras guardadas
export async function getVowelCounts() {
  const res = await fetch(`${API_URL}/counts`);
  return res.json();
}
