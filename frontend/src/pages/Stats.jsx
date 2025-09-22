import React from "react";
import { useTranslation } from "react-i18next"; // 👈 importamos traducción
import "../styles/stats.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: t("enero"), ejercicios: 30, aciertos: 25 },
  { name: t("febrero"), ejercicios: 50, aciertos: 42 },
  { name: t("marzo"), ejercicios: 40, aciertos: 38 },
  { name: t("abril"), ejercicios: 60, aciertos: 50 },
  { name: t("mayo"), ejercicios: 80, aciertos: 70 },
];

const Stats = () => {
  const { t } = useTranslation();

  return (
    <div className="stats-page">
      <h1>📊 {t("Estadísticas")}</h1>

      <div className="stats-grid">
        {/* Gráfico de líneas */}
        <div className="stats-card">
          <h2>{t("Progreso de aciertos")}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="aciertos" stroke="#16a34a" name={t("Aciertos")} />
              <Line type="monotone" dataKey="ejercicios" stroke="#2563eb" name={t("Ejercicios")} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras */}
        <div className="stats-card">
          <h2>{t("Ejercicios vs Aciertos")}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ejercicios" fill="#2563eb" name={t("Aciertos")} />
              <Bar dataKey="aciertos" fill="#16a34a" name={t("Ejercicios")} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;
