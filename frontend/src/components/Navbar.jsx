import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-logo">🎓 SignsApp</div>
      <nav className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/app">Entrenador</Link>
        <Link to="/stats">Estadísticas</Link>
        <Link to="/settings">Configuración</Link>
      </nav>
    </header>
  );
};

export default Navbar;
