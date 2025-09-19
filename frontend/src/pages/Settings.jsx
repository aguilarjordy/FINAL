import React, { useEffect, useState } from "react";
import "../styles/settings.css";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Cargar el tema guardado al entrar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Cambiar entre temas
  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  return (
    <div className="settings-page">
      <h1>⚙️ Configuración</h1>

      <div className="settings-card">
        <div className="settings-option">
          <span>🌙 Modo oscuro</span>
          <button className="toggle-btn" onClick={toggleTheme}>
            {darkMode ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-option">
          <span>🔔 Notificaciones</span>
          <button className="toggle-btn">Configurar</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
