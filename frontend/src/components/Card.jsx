import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Card = ({ title, text, link }) => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-card" style={{ fontSize: "var(--app-font-size)" }}>
      <h3>{t(title)}</h3>
      <p>{t(text)}</p>
      <Link to={link} className="card-btn">
        {t("common.go")}
      </Link>
    </div>
  );
};

export default Card;
