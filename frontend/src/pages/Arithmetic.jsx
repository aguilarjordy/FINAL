// src/pages/Arithmetic.jsx
import React from "react";
import OperationTrainer from "../components/OperationTrainer";
import OperationPanel from "../components/OperationPanel";
import "../styles/operations.css";

const Arithmetic = () => {
  return (
    <div className="arithmetic-page">
      <h1 className="arithmetic-title">
        🧮 Operaciones Aritméticas con Señas
      </h1>
      <p className="arithmetic-subtitle">
        Entrena el modelo recolectando muestras de números y operadores, y luego practica con tus manos.
      </p>
      <section className="arithmetic-section">
        <h2 className="section-title">📚 Entrenamiento del Modelo</h2>
        <OperationTrainer />
      </section>
      <section className="arithmetic-section">
        <h2 className="section-title">🧮 Panel de Operaciones</h2>
        <OperationPanel />
      </section>
    </div>
  );
};

export default Arithmetic;