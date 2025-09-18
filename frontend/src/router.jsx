import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import App from "./pages/App";
import MainLayout from "./layouts/MainLayout";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trainer" element={<App />} />
      </Route>
    </Routes>
  );
}
