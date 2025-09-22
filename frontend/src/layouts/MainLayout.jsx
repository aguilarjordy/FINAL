// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../styles/dashboard.css";
import "../styles/sidebar.css";

const MainLayout = () => {
  return (
    <div className="layout-container">
      {/* 🔹 Navbar superior */}
      <Navbar />

      {/* 🔹 Cuerpo con Sidebar + contenido dinámico */}
      <div className="layout-body">
        {/* Sidebar de navegación */}
        <Sidebar />

        {/* Aquí se renderizan las páginas */}
        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      {/* 🔹 Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
