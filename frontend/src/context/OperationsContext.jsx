import React, { createContext, useContext, useState } from "react";

// 📌 Contexto para compartir los datos de la operación
const OperationsContext = createContext();

export const OperationsProvider = ({ children }) => {
  const [firstNumber, setFirstNumber] = useState(null);
  const [operator, setOperator] = useState(null);
  const [secondNumber, setSecondNumber] = useState(null);
  const [result, setResult] = useState(null);

  // 🔹 Resetear operación actual
  const resetOperation = () => {
    setFirstNumber(null);
    setOperator(null);
    setSecondNumber(null);
    setResult(null);
  };

  return (
    <OperationsContext.Provider
      value={{
        firstNumber,
        operator,
        secondNumber,
        result,
        setFirstNumber,
        setOperator,
        setSecondNumber,
        setResult,
        resetOperation,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

// 📌 Hook para usarlo fácilmente en los componentes
export const useOperations = () => useContext(OperationsContext);
