import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 👈 importa hook
import "../styles/sidebar.css";

const Sidebar = () => {
  const { t } = useTranslation(); // 👈 habilita traducciones

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">📚 {t("app_name")}</h2> {/* 👈 traducible */}
      <ul className="sidebar-menu">
        <li>
          <Link to="/">🏠 {t("dashboard")}</Link>
        </li>
        <li>
          <Link to="/entrenador">🎓 {t("trainer")}</Link>
        </li>
        <li>
          <Link to="/aritmetica">🧮 {t("math_signs")}</Link>
        </li>
        <li>
          <Link to="/estadisticas">📊 {t("statistics")}</Link>
        </li>
        <li>
          <Link to="/configuracion">⚙️ {t("settings")}</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;

