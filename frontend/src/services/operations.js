// src/services/operations.js
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// 📌 Subir una muestra de operación (ejemplo: suma, resta, etc.)
export async function uploadOperationSample(data) {
  try {
    const res = await fetch(`${API}/api/operations/upload_sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("❌ Error al subir muestra de operación:", err);
    return null;
  }
}

// 📌 Entrenar el modelo de operaciones matemáticas
export async function trainOperationModel() {
  try {
    const res = await fetch(`${API}/api/operations/train`, {
      method: "POST",
    });
    return await res.json();
  } catch (err) {
    console.error("❌ Error al entrenar modelo de operaciones:", err);
    return null;
  }
}

// 📌 Obtener conteos de operaciones registradas
export async function getOperationCounts() {
  try {
    const res = await fetch(`${API}/api/operations/counts`);
    return await res.json();
  } catch (err) {
    console.error("❌ Error al traer conteos de operaciones:", err);
    return null;
  }
}
