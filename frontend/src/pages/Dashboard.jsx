// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 👈 importamos traducción
import "../styles/dashboard.css";
import AchievementsCard from "../components/AchievementsCard";

function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 {t("panel de control")}</h1>
        <p>{t("Bienvenido al panel de control")}</p>
      </header>

      <div className="dashboard-cards">
        {/* Tarjeta destacada: App Principal */}
        <Link to="/entrenador" className="card card-primary">
          <div className="card-icon">🎓</div>
          <h2>{t("Entrena y aprende las vocales")}</h2>
          <p>{t("Accede al entrenador interactivo de la aplicación")}</p>
        </Link>

        {/* Nueva tarjeta: Operaciones Aritméticas */}
        <Link to="/aritmetica" className="card card-success">
          <div className="card-icon">🧮</div>
          <h2>{t("Operaciones Aritmeticas con Señas")}</h2>
          <p>{t("Practica sumas, restas y más con lenguaje de señas")}</p>
        </Link>

        {/* Tarjeta: Estadísticas */}
        <Link to="/estadisticas" className="card card-info">
          <div className="card-icon">📈</div>
          <h2>{t("Estadísticas")}</h2>
          <p>{t("Consulta, reportes y métricas")}</p>
        </Link>

        {/* Tarjeta: Configuración */}
        <Link to="/configuracion" className="card card-warning">
          <div className="card-icon">⚙️</div>
          <h2>{t("configuración")}</h2>
          <p>{t("Ajusta las preferencias del sistema")}</p>
        </Link>

        {/* Tarjeta de Logros */}
        <AchievementsCard />
      </div>
    </div>
  );
}

export default Dashboard;
