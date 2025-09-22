// src/components/Footer.jsx
import React from "react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} {t("Lengua VisualWeb")} | {t("Proyecto de Reconocimiento de Señales")}
      </p>
    </footer>
  );
}

export default Footer;
