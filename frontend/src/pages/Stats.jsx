import React from "react";
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
  { name: "Enero", ejercicios: 30, aciertos: 25 },
  { name: "Febrero", ejercicios: 50, aciertos: 42 },
  { name: "Marzo", ejercicios: 40, aciertos: 38 },
  { name: "Abril", ejercicios: 60, aciertos: 50 },
  { name: "Mayo", ejercicios: 80, aciertos: 70 },
];

const Stats = () => {
  return (
    <div className="stats-page">
      <h1>📊 Estadísticas</h1>

      <div className="stats-grid">
        {/* Gráfico de líneas */}
        <div className="stats-card">
          <h2>Progreso de aciertos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="aciertos" stroke="#16a34a" />
              <Line type="monotone" dataKey="ejercicios" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras */}
        <div className="stats-card">
          <h2>Ejercicios vs Aciertos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ejercicios" fill="#2563eb" />
              <Bar dataKey="aciertos" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;
