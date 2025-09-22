import React, { useEffect, useState } from "react";
import "../styles/settings.css";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const [language, setLanguage] = useState("es");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // 🌙 Tema guardado
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // 🔠 Tamaño de letra guardado
    const savedFont = localStorage.getItem("fontSize");
    if (savedFont) {
      setFontSize(savedFont);
      applyFontSize(savedFont);
    }

    // 🌐 Idioma guardado
    const savedLang = localStorage.getItem("language");
    if (savedLang) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    } else {
      i18n.changeLanguage("es"); // Español por defecto
    }
  }, []);

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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    setLanguage(lng);
  };

  // ✅ Ajuste directo del tamaño
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
    applyFontSize(size);
  };

  const applyFontSize = (size) => {
    if (size === "small") {
      document.documentElement.style.setProperty("--font-size", "14px");
    } else if (size === "normal") {
      document.documentElement.style.setProperty("--font-size", "16px");
    } else if (size === "large") {
      document.documentElement.style.setProperty("--font-size", "18px");
    }
  };

  return (
    <div className="settings-page">
      <h1>⚙️ {t("settings")}</h1>

      {/* Modo oscuro */}
      <div className="settings-card">
        <div className="settings-option">
          <span>🌙 {t("dark_mode")}</span>
          <button className="toggle-btn" onClick={toggleTheme}>
            {darkMode ? t("disable") : t("enable")}
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="settings-card">
        <div className="settings-option">
          <span>🔔 {t("notifications")}</span>
          <button className="toggle-btn">{t("configure")}</button>
        </div>
      </div>

      {/* Idiomas */}
      <div className="settings-card">
        <div className="settings-option">
          <span>🌐 {t("languages")}</span>
          <div className="language-buttons">
            <button
              className={`toggle-btn ${language === "es" ? "active" : ""}`}
              onClick={() => changeLanguage("es")}
            >
              {t("spanish")}
            </button>
            <button
              className={`toggle-btn ${language === "en" ? "active" : ""}`}
              onClick={() => changeLanguage("en")}
            >
              {t("english")}
            </button>
            <button
              className={`toggle-btn ${language === "pt" ? "active" : ""}`}
              onClick={() => changeLanguage("pt")}
            >
              {t("portuguese")}
            </button>
          </div>
        </div>
      </div>

      {/* Tamaño de letra */}
      <div className="settings-card">
        <div className="settings-option">
          <span>🔎 {t("font_size")}</span>
          <div className="language-buttons">
            <button
              className={`toggle-btn ${fontSize === "small" ? "active" : ""}`}
              onClick={() => changeFontSize("small")}
            >
              {t("small")}
            </button>
            <button
              className={`toggle-btn ${fontSize === "normal" ? "active" : ""}`}
              onClick={() => changeFontSize("normal")}
            >
              {t("normal")}
            </button>
            <button
              className={`toggle-btn ${fontSize === "large" ? "active" : ""}`}
              onClick={() => changeFontSize("large")}
            >
              {t("large")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
