import React, { useState } from "react";
import * as hands from "@mediapipe/hands";
import {
  uploadOperationSample,
  trainOperationModel,
  getOperationCounts,
} from "../services/operations";

export default function OperationTrainer() {
  const [operation, setOperation] = useState("");
  const [message, setMessage] = useState("");
  const [counts, setCounts] = useState(null);

  // 📌 Subir una muestra de operación
  const handleUploadSample = async () => {
    if (!operation) {
      setMessage("⚠️ Selecciona una operación antes de subir.");
      return;
    }

    try {
      const response = await uploadOperationSample({ operation });
      if (response?.success) {
        setMessage(`✅ Muestra registrada para ${operation}`);
        loadCounts();
      } else {
        setMessage("❌ Error al registrar muestra");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al comunicar con el backend");
    }
  };

  // 📌 Entrenar modelo
  const handleTrain = async () => {
    try {
      const response = await trainOperationModel();
      if (response?.success) {
        setMessage("✅ Modelo de operaciones entrenado con éxito");
      } else {
        setMessage("❌ Error al entrenar modelo");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al entrenar modelo");
    }
  };

  // 📌 Traer conteos de operaciones
  const loadCounts = async () => {
    try {
      const response = await getOperationCounts();
      setCounts(response);
    } catch (err) {
      console.error("Error al cargar conteos:", err);
    }
  };

  return (
    <div className="operation-trainer">
      <h2>Entrenador de Operaciones Matemáticas</h2>

      {/* Selección de operación */}
      <select value={operation} onChange={(e) => setOperation(e.target.value)}>
        <option value="">-- Selecciona una operación --</option>
        <option value="suma">➕ Suma</option>
        <option value="resta">➖ Resta</option>
        <option value="multiplicacion">✖️ Multiplicación</option>
        <option value="division">➗ División</option>
      </select>

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleUploadSample}>📤 Subir muestra</button>
        <button onClick={handleTrain}>⚙️ Entrenar modelo</button>
        <button onClick={loadCounts}>📊 Ver conteos</button>
      </div>

      {/* Mensajes */}
      {message && <p>{message}</p>}

      {/* Conteos */}
      {counts && (
        <div style={{ marginTop: "10px" }}>
          <h3>📊 Conteos registrados:</h3>
          <pre>{JSON.stringify(counts, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
