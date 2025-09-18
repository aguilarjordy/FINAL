import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        📊 Panel de Control
      </h1>

      <p className="mb-4 text-gray-700">
        Bienvenido al sistema. Desde aquí puedes acceder a las secciones
        principales:
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Botón hacia tu App.jsx (NO se toca App.jsx) */}
        <Link
          to="/app"
          className="bg-blue-600 text-white px-6 py-4 rounded-xl shadow hover:bg-blue-800 transition text-center"
        >
          🚀 Ir a la Aplicación
        </Link>

        {/* Otras secciones opcionales */}
        <Link
          to="/stats"
          className="bg-green-600 text-white px-6 py-4 rounded-xl shadow hover:bg-green-800 transition text-center"
        >
          📈 Estadísticas
        </Link>

        <Link
          to="/settings"
          className="bg-gray-700 text-white px-6 py-4 rounded-xl shadow hover:bg-gray-900 transition text-center"
        >
          ⚙️ Configuración
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
