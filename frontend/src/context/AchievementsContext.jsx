import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const AchievementsContext = createContext();
const API_URL = import.meta.env.VITE_API_BASE_URL;

// 🔹 Definición de logros disponibles
const ALL_ACHIEVEMENTS = {
  MASTER_VOWELS: {
    id: "master_vowels",
    title: "Logro Master",
    description: "Reconoce las 5 vocales por primera vez",
  },
  // Aquí puedes ir agregando más logros si deseas
};

export const AchievementsProvider = ({ children }) => {
  const [achievements, setAchievements] = useState([]);
  const [recognizedVowels, setRecognizedVowels] = useState(new Set());

  // 🔹 Cargar progreso inicial desde el backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/api/achievements/progress`);
        if (!res.ok) throw new Error("Error en la petición");
        const data = await res.json();

        if (data.unlocked) {
          setAchievements(data.unlocked);
        }

        if (data.recognizedVowels) {
          setRecognizedVowels(new Set(data.recognizedVowels));
        }
      } catch (err) {
        console.error("❌ Error al obtener logros iniciales:", err.message);
      }
    };

    fetchProgress();
  }, []);

  // 🔹 Marcar un logro como desbloqueado
  const unlockAchievement = useCallback((achievementId) => {
    setAchievements((prev) => {
      if (prev.includes(achievementId)) return prev;
      return [...prev, achievementId];
    });

    // Opcional: Notificar al backend
    fetch(`${API_URL}/api/achievements/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievementId }),
    }).catch((err) =>
      console.error("❌ Error al guardar logro en backend:", err.message)
    );
  }, []);

  // 🔹 Registrar una vocal reconocida
  const registerVowel = useCallback(
    (vowel) => {
      setRecognizedVowels((prev) => {
        const updated = new Set(prev).add(vowel);

        // Verificar logro MASTER (cuando reconoce las 5 vocales)
        if (updated.size === 5 && !achievements.includes("master_vowels")) {
          unlockAchievement("master_vowels");
        }

        return updated;
      });
    },
    [achievements, unlockAchievement]
  );

  // 🔹 Reinicia logros y progreso
  const resetAchievements = useCallback(() => {
    setAchievements([]);
    setRecognizedVowels(new Set());

    fetch(`${API_URL}/api/achievements/reset`, {
      method: "POST",
    }).catch((err) =>
      console.error("❌ Error al reiniciar logros en backend:", err.message)
    );
  }, []);

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        recognizedVowels,
        updateAchievements: setAchievements,
        resetAchievements,
        registerVowel,
      }}
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
