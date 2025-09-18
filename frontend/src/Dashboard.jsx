import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8">📊 Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tarjeta App */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-between">
          <h2 className="text-xl font-semibold mb-4">Entrenador de Vocales ✋🎤</h2>
          <p className="text-gray-600 mb-4 text-center">
            Accede a la aplicación de entrenamiento y predicción de vocales con la cámara.
          </p>
          <Link
            to="/app"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ir a la App
          </Link>
        </div>

        {/* Ejemplo de otra tarjeta */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-between">
          <h2 className="text-xl font-semibold mb-4">📈 Métricas</h2>
          <p className="text-gray-600 mb-4 text-center">
            Aquí puedes mostrar estadísticas o reportes más adelante.
          </p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Ver métricas
          </button>
        </div>
      </div>
    </div>
  );
}
