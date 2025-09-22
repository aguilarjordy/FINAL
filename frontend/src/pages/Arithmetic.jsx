import React from "react";
import OperationTrainer from "../components/OperationTrainer";
import OperationPanel from "../components/OperationPanel";
import "../styles/operations.css"; // 🔹 Importar estilos propios

const Arithmetic = () => {
  return (
    <div className="arithmetic-page">
      {/* Encabezado */}
      <h1 className="arithmetic-title">
        🧮 Operaciones Aritméticas con Señas
      </h1>
      <p className="arithmetic-subtitle">
        Entrena el modelo recolectando muestras de números y operadores, 
        y luego practica sumas, restas, multiplicaciones y divisiones con tus manos.
      </p>

      {/* Sección Entrenador */}
      <section className="arithmetic-section">
        <h2 className="section-title">📚 Entrenamiento</h2>
        <p className="section-description">
          Guarda muestras de tus señas para números y operadores. 
          Cuando tengas suficientes ejemplos, entrena el modelo.
        </p>
        <OperationTrainer />
      </section>

      {/* Sección Panel */}
      <section className="arithmetic-section">
        <h2 className="section-title">🧮 Panel de Operaciones</h2>
        <p className="section-description">
          Usa la cámara para reconocer tus señas y resolver operaciones aritméticas.
        </p>
        <OperationPanel />
      </section>
    </div>
  );
};

export default Arithmetic;
