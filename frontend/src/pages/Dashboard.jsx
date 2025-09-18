import React from "react";
import Card from "../components/Card";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel Principal</h2>
      <div className="dashboard-grid">
        <Card title="Entrenamiento" description="Accede al módulo para entrenar el modelo.">
          <a href="/app" className="text-blue-600 hover:underline">Ir al App</a>
        </Card>
        <Card title="Reportes" description="Consulta estadísticas de uso y rendimiento.">
          <button className="text-blue-600 hover:underline">Ver más</button>
        </Card>
        <Card title="Configuración" description="Administra opciones y ajustes del sistema.">
          <button className="text-blue-600 hover:underline">Configurar</button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
