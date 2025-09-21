import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { speak } from "../utils/speech"; // 👈 voz

const AchievementsContext = createContext();
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const AchievementsProvider = ({ children }) => {
  const [achievements, setAchievements] = useState([]);
  const [announced, setAnnounced] = useState([]); // 👈 logros ya anunciados

  // 🔹 Cargar progreso inicial desde el backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/api/achievements/progress`);
        if (!res.ok) throw new Error("Error en la petición");
        const data = await res.json();
        if (data.unlocked) {
          setAchievements(data.unlocked);
          setAnnounced(data.unlocked); // 👈 marcamos como ya anunciados
        }
      } catch (err) {
        console.error("❌ Error al obtener logros iniciales:", err.message);
      }
    };

    fetchProgress();
  }, []);

  // 🔹 Actualiza logros (sobrescribe con lista nueva desde backend)
  const updateAchievements = useCallback((newAchievements) => {
    if (!Array.isArray(newAchievements)) return;

    // Detectar cuáles son realmente nuevos
    const onlyNew = newAchievements.filter(
      (ach) => !achievements.includes(ach)
    );

    if (onlyNew.length > 0) {
      onlyNew.forEach((ach) => {
        if (!announced.includes(ach)) {
          speak(`Logro conseguido: ${ach}`);
        }
      });
      setAnnounced((prev) => [...prev, ...onlyNew]);
    }

    setAchievements(newAchievements);
  }, [achievements, announced]);

  // 🔹 Reinicia logros
  const resetAchievements = useCallback(() => {
    setAchievements([]);
    setAnnounced([]);
  }, []);

  return (
    <AchievementsContext.Provider
      value={{ achievements, updateAchievements, resetAchievements }}
    >
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error("useAchievements debe usarse dentro de un AchievementsProvider");
  }
  return context;
};
