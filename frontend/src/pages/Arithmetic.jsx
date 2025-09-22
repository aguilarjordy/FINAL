import React from "react";
import OperationPanel from "../components/OperationPanel";

const Arithmetic = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        🧮 Operaciones Aritméticas con Señas
      </h1>
      <p className="text-gray-600 mb-6">
        Practica sumas, restas, multiplicaciones y divisiones usando
        lenguaje de señas. El sistema reconocerá los números y operadores
        desde tu cámara.
      </p>

      {/* Panel principal */}
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xl mx-auto">
        <OperationPanel />
      </div>
    </div>
  );
};

export default Arithmetic;
