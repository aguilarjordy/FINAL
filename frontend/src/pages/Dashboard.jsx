import React from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Panel de Control</h1>
        <p>
          Bienvenido al sistema. Desde aquí puedes acceder a las secciones
          principales:
        </p>
      </header>

      <div className="dashboard-cards">
        {/* Tarjeta que abre App.jsx completo */}
        <Link to="/entrenador" className="card card-primary">
          <div className="card-icon">💻</div>
          <h2>App Principal</h2>
          <p>Abrir toda la aplicación principal.</p>
        </Link>

        <Link to="/estadisticas" className="card card-info">
          <div className="card-icon">📈</div>
          <h2>Estadísticas</h2>
          <p>Consulta reportes y métricas.</p>
        </Link>

        <Link to="/configuracion" className="card card-warning">
          <div className="card-icon">⚙️</div>
          <h2>Configuración</h2>
          <p>Ajusta las preferencias del sistema.</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
