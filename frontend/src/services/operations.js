const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 📌 Subir landmarks
export async function uploadOperation(label, landmarks) {
  const res = await fetch(`${API_URL}/api/operations/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, landmarks }),
  });
  return res.json();
}

// 📌 Entrenar modelo
export async function trainOperations() {
  const res = await fetch(`${API_URL}/api/operations/train`, {
    method: "POST",
  });
  return res.json();
}

// 📌 Predecir operación
export async function predictOperation(landmarks) {
  const res = await fetch(`${API_URL}/api/operations/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks }),
  });
  return res.json();
}

// 📌 Calcular directamente
export async function calculateOperation(first, operator, second) {
  const res = await fetch(`${API_URL}/api/operations/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first, operator, second }),
  });
  return res.json();
}

// 📌 Obtener conteos
export async function getOperationCounts() {
  const res = await fetch(`${API_URL}/api/operations/counts`);
  return res.json();
}
