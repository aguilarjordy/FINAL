import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { ThemeProvider } from "./context/ThemeContext";
import { AchievementsProvider } from "./context/AchievementsContext"; 
import { TrainerProvider } from "./context/TrainerContext";   // ⬅️ importa tu provider
import { Toaster } from "react-hot-toast";
import "./styles/styles.css";
import "./locales/i18n"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AchievementsProvider>
          <TrainerProvider> {/* ⬅️ Aquí lo envolvemos */}
            <AppRouter />
            <Toaster position="top-right" reverseOrder={false} />
          </TrainerProvider>
        </AchievementsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
