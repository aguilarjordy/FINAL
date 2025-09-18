// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../styles/dashboard.css";
import "../styles/sidebar.css"; // ✅ importa estilos del sidebar

const MainLayout = () => {
  return (
    <div className="layout-container">
      <Navbar />
      <div className="layout-body">
        {/* Sidebar a la izquierda */}
        <Sidebar />

        {/* Contenido a la derecha */}
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
