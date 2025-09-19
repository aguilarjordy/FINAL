import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import App from "./pages/App";
import Stats from "./pages/Stats";           // 📊 Página de estadísticas
import Settings from "./pages/Settings";     // ⚙️ Página de configuración

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas con layout principal */}
      <Route path="/" element={<MainLayout />}>
        {/* Página inicial -> Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Ruta al App principal (Entrena y aprende las vocales) */}
        <Route path="entrenador" element={<App />} />

        {/* Otras secciones */}
        <Route path="estadisticas" element={<Stats />} />
        <Route path="configuracion" element={<Settings />} />

        {/* catch-all */}
        <Route path="*" element={<div>❌ Página no encontrada</div>} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
