import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 👈 importa hook
import "../styles/sidebar.css";

const Sidebar = () => {
  const { t } = useTranslation(); // 👈 habilita traducciones

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">📚 {t("Lenguaje de señas")}</h2> {/* 👈 traducible */}
      <ul className="sidebar-menu">
        <li>
          <Link to="/">🏠 {t("Panel de control")}</Link>
        </li>
        <li>
          <Link to="/entrenador">🎓 {t("Entrenador")}</Link>
        </li>
        <li>
          <Link to="/aritmetica">🧮 {t("Operaciones Aritméticas con Señas")}</Link>
        </li>
        <li>
          <Link to="/estadisticas">📊 {t("Estadísticas")}</Link>
        </li>
        <li>
          <Link to="/configuracion">⚙️ {t("Configuración")}</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;

