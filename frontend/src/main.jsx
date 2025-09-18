// src/router.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import App from "./pages/App";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="app" element={<App />} />
        <Route path="stats" element={<div>📊 Aquí irán las estadísticas</div>} />
        <Route path="settings" element={<div>⚙️ Configuración</div>} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
