import React from "react";
import { useTranslation } from "react-i18next"; // 👈 importamos traducción

const Arithmetic = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🧮 {t("Operaciones Aritméticas con Señas")}</h1>
      <p>{t("Aquí podrás practicar sumas, restas y otras operaciones usando lenguaje de señas")}</p>
    </div>
  );
};

export default Arithmetic;
