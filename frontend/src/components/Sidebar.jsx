import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul>
        <li><Link to="/">🏠 Dashboard</Link></li>
        <li><Link to="/app">✋ Entrenador</Link></li>
        <li><Link to="/stats">📊 Estadísticas</Link></li>
        <li><Link to="/settings">⚙️ Configuración</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
