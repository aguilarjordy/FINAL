// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/navbar.css"; // importa estilos del navbar

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-logo">🎓 Lengua VisualWeb</div>
      <nav className="navbar-links">
        <NavLink to="/dashboard" className="nav-item">
          Dashboard
        </NavLink>
        <NavLink to="/entrenador" className="nav-item">
          Entrenador
        </NavLink>
        <NavLink to="/estadisticas" className="nav-item">
          Estadísticas
        </NavLink>
        <NavLink to="/configuracion" className="nav-item">
          Configuración
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
