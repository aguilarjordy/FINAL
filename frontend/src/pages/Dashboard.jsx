// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";
import AchievementsCard from "../components/AchievementsCard"; // ⬅️ importado

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
        {/* Tarjeta destacada: App Principal */}
        <Link to="/entrenador" className="card card-primary">
          <div className="card-icon">🎓</div>
          <h2>Entrena y aprende las vocales</h2>
          <p>Accede al entrenador interactivo de la aplicación.</p>
        </Link>

        {/* Nueva tarjeta: Operaciones Aritméticas */}
        <Link to="/aritmetica" className="card card-success">
          <div className="card-icon">🧮</div>
          <h2>Operaciones Aritméticas con Señas</h2>
          <p>Practica sumas, restas y más con lenguaje de señas.</p>
        </Link>

        {/* Tarjeta: Estadísticas */}
        <Link to="/estadisticas" className="card card-info">
          <div className="card-icon">📈</div>
          <h2>Estadísticas</h2>
          <p>Consulta reportes y métricas.</p>
        </Link>

        {/* Tarjeta: Configuración */}
        <Link to="/configuracion" className="card card-warning">
          <div className="card-icon">⚙️</div>
          <h2>Configuración</h2>
          <p>Ajusta las preferencias del sistema.</p>
        </Link>

        {/* Tarjeta de Logros */}
        <AchievementsCard />
      </div>
    </div>
  );
}

export default Dashboard;
