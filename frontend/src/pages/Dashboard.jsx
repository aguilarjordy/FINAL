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
        <h1>📊 {t("dashboard_title")}</h1>
        <p>{t("dashboard_welcome")}</p>
      </header>

      <div className="dashboard-cards">
        {/* Tarjeta destacada: App Principal */}
        <Link to="/entrenador" className="card card-primary">
          <div className="card-icon">🎓</div>
          <h2>{t("dashboard_train_title")}</h2>
          <p>{t("dashboard_train_desc")}</p>
        </Link>

        {/* Nueva tarjeta: Operaciones Aritméticas */}
        <Link to="/aritmetica" className="card card-success">
          <div className="card-icon">🧮</div>
          <h2>{t("dashboard_math_title")}</h2>
          <p>{t("dashboard_math_desc")}</p>
        </Link>

        {/* Tarjeta: Estadísticas */}
        <Link to="/estadisticas" className="card card-info">
          <div className="card-icon">📈</div>
          <h2>{t("dashboard_stats_title")}</h2>
          <p>{t("dashboard_stats_desc")}</p>
        </Link>

        {/* Tarjeta: Configuración */}
        <Link to="/configuracion" className="card card-warning">
          <div className="card-icon">⚙️</div>
          <h2>{t("dashboard_settings_title")}</h2>
          <p>{t("dashboard_settings_desc")}</p>
        </Link>

        {/* Tarjeta de Logros */}
        <AchievementsCard />
      </div>
    </div>
  );
}

export default Dashboard;
