import json
import os

# Archivo donde se guardarán los logros de manera persistente
ACHIEVEMENTS_FILE = "achievements.json"

# Lista de logros disponibles
ALL_ACHIEVEMENTS = {
    "first_a": "Primera vocal A reconocida",
    "first_e": "Primera vocal E reconocida",
    "first_i": "Primera vocal I reconocida",
    "first_o": "Primera vocal O reconocida",
    "first_u": "Primera vocal U reconocida",
    "five_predictions": "Cinco predicciones realizadas"
}


def _load_progress():
    """Carga el estado de los logros desde el archivo JSON."""
    if not os.path.exists(ACHIEVEMENTS_FILE):
        return {key: False for key in ALL_ACHIEVEMENTS.keys()}
    with open(ACHIEVEMENTS_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = {}
    # Aseguramos que todos los logros existan
    return {key: data.get(key, False) for key in ALL_ACHIEVEMENTS.keys()} | {
        "_count": data.get("_count", 0)
    }


def _save_progress(progress):
    """Guarda el estado de los logros en el archivo JSON."""
    with open(ACHIEVEMENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=4, ensure_ascii=False)


def record_vocal(vocal, correct=True):
    """
    Registra la vocal reconocida y actualiza progreso.
    Retorna el estado actualizado de logros.
    """
    progress = _load_progress()

    if correct:
        # 🔹 Desbloqueo según la vocal
        if vocal.lower() == "a":
            progress["first_a"] = True
        elif vocal.lower() == "e":
            progress["first_e"] = True
        elif vocal.lower() == "i":
            progress["first_i"] = True
        elif vocal.lower() == "o":
            progress["first_o"] = True
        elif vocal.lower() == "u":
            progress["first_u"] = True

        # 🔹 Contamos predicciones correctas
        count = int(progress.get("_count", 0)) + 1
        progress["_count"] = count

        if count >= 5:
            progress["five_predictions"] = True

    _save_progress(progress)
    return progress


def check_new_achievements(prev_progress, new_progress):
    """
    Devuelve SOLO los logros recién desbloqueados (False → True).
    """
    unlocked = []
    for key, desc in ALL_ACHIEVEMENTS.items():
        if not prev_progress.get(key, False) and new_progress.get(key, False):
            unlocked.append(desc)
    return unlocked


def get_progress():
    """
    Devuelve el estado actual de los logros (sin incluir "_count").
    """
    progress = _load_progress()
    return {k: v for k, v in progress.items() if not k.startswith("_")}


def reset_achievements():
    """
    Reinicia todos los logros a False y el contador a 0.
    """
    progress = {key: False for key in ALL_ACHIEVEMENTS.keys()}
    progress["_count"] = 0
    _save_progress(progress)
    return progress
