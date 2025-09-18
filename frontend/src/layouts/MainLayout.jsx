import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="app-container">
      {/* 🔹 Barra superior */}
      <Navbar />

      <div className="app-body">
        {/* 🔹 Barra lateral */}
        <Sidebar />

        {/* 🔹 Contenido principal */}
        <main className="main-content">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
