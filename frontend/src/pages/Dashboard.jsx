import React from "react";
import Card from "../components/Card";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Panel Principal</h1>
      <div className="dashboard-grid">
        <Card title="Entrenador" text="Recolecta y entrena tus vocales." link="/app" />
        <Card title="Estadísticas" text="Consulta métricas de tu entrenamiento." link="/stats" />
        <Card title="Configuración" text="Ajusta la app a tus necesidades." link="/settings" />
      </div>
    </div>
  );
};

export default Dashboard;
