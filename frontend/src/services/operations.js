import axios from "axios";

// ⚠️ IMPORTANTE: cambia esta URL por la de tu backend en Render
const API_URL = "https://final-dev-back.onrender.com/api/operations";

/**
 * 📌 Sube una muestra etiquetada al backend
 * @param {string} label - Etiqueta (ejemplo: "number:5", "operator:+")
 * @param {Array<number>} landmarks - Coordenadas de la mano
 */
export const uploadOperationSample = async (label, landmarks) => {
  return axios.post(`${API_URL}/upload`, { label, landmarks });
};

/**
 * 📌 Entrena el modelo de operaciones en backend
 */
export const trainOperationModel = async () => {
  return axios.post(`${API_URL}/train`);
};

/**
 * 📌 Predice un número u operador a partir de landmarks
 * @param {Array<number>} landmarks - Coordenadas extraídas de la mano
 */
export const predictOperation = async (landmarks) => {
  return axios.post(`${API_URL}/predict`, { landmarks });
};

/**
 * 📌 Calcula la operación en el backend
 * @param {number} first - Primer número
 * @param {string} operator - Operador (+, -, *, /)
 * @param {number} second - Segundo número
 */
export const calculateOperation = async (first, operator, second) => {
  return axios.post(`${API_URL}/calculate`, { first, operator, second });
};
