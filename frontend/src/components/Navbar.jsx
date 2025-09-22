// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 👈 importar hook
import "../styles/navbar.css";

const Navbar = () => {
  const { t } = useTranslation(); // 👈 activar traducción

  return (
    <header className="navbar">
      <div className="navbar-logo">🎓 Lengua VisualWeb</div>
      <nav className="navbar-links">
        <NavLink to="/" end className="nav-item">
          {t("dashboard")}
        </NavLink>
        <NavLink to="/entrenador" className="nav-item">
          {t("trainer")}
        </NavLink>
        <NavLink to="/aritmetica" className="nav-item">
          {t("arithmetic")}
        </NavLink>
        <NavLink to="/estadisticas" className="nav-item">
          {t("statistics")}
        </NavLink>
        <NavLink to="/configuracion" className="nav-item">
          {t("settings")}
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
