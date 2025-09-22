import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationES from "./es/translation.json";
import translationEN from "./en/translation.json";
import translationPT from "./pt/translation.json";

const resources = {
  es: { translation: translationES },
  en: { translation: translationEN },
  pt: { translation: translationPT }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es", // Español como estándar
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
