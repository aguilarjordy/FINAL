import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";

// Contextos
import { ThemeProvider } from "./context/ThemeContext";
import { AchievementsProvider } from "./context/AchievementsContext";
import { TrainerProvider } from "./context/TrainerContext";
import { OperationsProvider } from "./context/OperationsContext";

import { Toaster } from "react-hot-toast";
import "./styles/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AchievementsProvider>
          <TrainerProvider>
            <OperationsProvider>
              <AppRouter />
              <Toaster position="top-right" reverseOrder={false} />
            </OperationsProvider>
          </TrainerProvider>
        </AchievementsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
