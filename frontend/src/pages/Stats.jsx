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
  { name: "enero", ejercicios: 30, aciertos: 25 },
  { name: "febrero", ejercicios: 50, aciertos: 42 },
  { name: "marzo", ejercicios: 40, aciertos: 38 },
  { name: "abril", ejercicios: 60, aciertos: 50 },
  { name: "mayo", ejercicios: 80, aciertos: 70 },
];

const Stats = () => {
  const { t } = useTranslation();

  return (
    <div className="stats-page">
      <h1>📊 {t("stats_title")}</h1>

      <div className="stats-grid">
        {/* Gráfico de líneas */}
        <div className="stats-card">
          <h2>{t("stats_progress_title")}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="aciertos" stroke="#16a34a" name={t("stats_correct")} />
              <Line type="monotone" dataKey="ejercicios" stroke="#2563eb" name={t("stats_exercises")} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras */}
        <div className="stats-card">
          <h2>{t("stats_ex_vs_corr")}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ejercicios" fill="#2563eb" name={t("stats_exercises")} />
              <Bar dataKey="aciertos" fill="#16a34a" name={t("stats_correct")} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;
