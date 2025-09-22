// src/utils/speech.js
export const speak = (text) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES"; // Español
    speechSynthesis.speak(utterance);
  } else {
    console.warn("Tu navegador no soporta SpeechSynthesis");
  }
};
