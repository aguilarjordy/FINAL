import React, { createContext, useState, useEffect } from "react";

// Creamos el contexto
export const ThemeContext = createContext();

// Proveedor de tema
export const ThemeProvider = ({ children }) => {
  // Estado inicial: revisa si el usuario ya eligió un tema antes
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Cada vez que cambie el tema, se guarda y se aplica al <body>
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Función para alternar entre claro/oscuro
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
