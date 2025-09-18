import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="layout-container">
      {/* Barra superior */}
      <Navbar />

      <div className="layout-content">
        {/* Barra lateral */}
        <Sidebar />

        {/* Contenido dinámico */}
        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      {/* Pie de página */}
      <Footer />
    </div>
  );
};

export default MainLayout;
