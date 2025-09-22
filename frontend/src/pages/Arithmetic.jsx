import React from "react";
import { useTranslation } from "react-i18next"; // 👈 importamos traducción

const Arithmetic = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🧮 {t("math_operations_title")}</h1>
      <p>{t("math_operations_desc")}</p>
    </div>
  );
};

export default Arithmetic;
