import React from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css"; // CSS ya creado en tu proyecto

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Panel de Control</h1>
      <p className="dashboard-subtitle">
        Bienvenido al sistema. Desde aquí puedes acceder a las secciones principales:
      </p>

      <div className="dashboard-cards">
        <Link to="/entrenador" className="card">
          <span className="card-icon">🚀</span>
          <h2>Aplicación</h2>
          <p>Ir al entrenador de la aplicación.</p>
        </Link>

        <Link to="/estadisticas" className="card">
          <span className="card-icon">📈</span>
          <h2>Estadísticas</h2>
          <p>Consulta reportes y métricas.</p>
        </Link>

        <Link to="/configuracion" className="card">
          <span className="card-icon">⚙️</span>
          <h2>Configuración</h2>
          <p>Ajusta las preferencias del sistema.</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
