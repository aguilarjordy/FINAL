import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <p className="text-gray-600">Bienvenido, selecciona una opción</p>
      </header>

      {/* Grid de tarjetas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta 1: Entrenador de Vocales */}
        <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            🎤 Entrenador de Vocales
          </h2>
          <p className="text-gray-600 mb-4">
            Usa la cámara para recolectar datos, entrenar y predecir tus
            vocales en tiempo real.
          </p>
          <Link
            to="/app"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Ir al App
          </Link>
        </div>

        {/* Tarjeta 2: Estadísticas */}
        <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            📈 Estadísticas
          </h2>
          <p className="text-gray-600 mb-4">
            Visualiza métricas del modelo, conteo de datos y rendimiento.
          </p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            Ver estadísticas
          </button>
        </div>

        {/* Tarjeta 3: Configuración */}
        <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            ⚙️ Configuración
          </h2>
          <p className="text-gray-600 mb-4">
            Reinicia datos, limpia memoria o ajusta parámetros del modelo.
          </p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Resetear
          </button>
        </div>
      </div>
    </div>
  );
}
