import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#2a5298] text-white h-screen p-6 hidden md:block">
      <h2 className="text-lg font-semibold mb-6">Menú</h2>
      <ul className="space-y-4">
        <li><a href="/" className="hover:underline">Dashboard</a></li>
        <li><a href="/app" className="hover:underline">App de Entrenamiento</a></li>
        <li><a href="#" className="hover:underline">Reportes</a></li>
        <li><a href="#" className="hover:underline">Configuración</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
