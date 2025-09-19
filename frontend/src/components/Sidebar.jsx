import React from "react";
import { Link } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">📚 Lengua VisualWeb</h2>
      <ul className="sidebar-menu">
        <li>
          <Link to="/">🏠 Dashboard</Link>
        </li>
        <li>
          <Link to="/entrenador">🎓 Entrenador</Link>
        </li>
        <li>
          <Link to="/estadisticas">📊 Estadísticas</Link>
        </li>
        <li>
          <Link to="/configuracion">⚙️ Configuración</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
