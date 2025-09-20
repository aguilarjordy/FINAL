# backend/achievements.py
import json
import os

STORE = os.path.join(os.path.dirname(__file__), "achievements_store.json")
DEFAULT_PROGRESS = {
    "A": 0, "E": 0, "I": 0, "O": 0, "U": 0,
    "streak": 0, "total_hits": 0, "unlocked": []
}

def _load():
    if os.path.exists(STORE):
        try:
            with open(STORE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_PROGRESS.copy()
    return DEFAULT_PROGRESS.copy()

def _save(progress):
    with open(STORE, "w", encoding="utf-8") as f:
        json.dump(progress, f)

def get_progress():
    return _load()

def record_vocal(vocal, correct=True):
    p = _load()
    if not correct:
        p["streak"] = 0
        _save(p)
        return p
    v = (vocal or "").upper()
    if v in ["A","E","I","O","U"]:
        p[v] = p.get(v, 0) + 1
    p["streak"] = p.get("streak", 0) + 1
    p["total_hits"] = p.get("total_hits", 0) + 1
    _save(p)
    return p

def check_new_achievements(progress=None):
    if progress is None:
        progress = _load()
    new = []
    def unlock(id, title, desc):
        if id not in progress["unlocked"]:
            progress["unlocked"].append(id)
            new.append({"id": id, "title": title, "desc": desc})
    # reglas (ejemplos)
    if progress.get("A", 0) >= 5:
        unlock("A_MASTER", "Maestro de la A", "Decir la A correctamente 5 veces")
    if all(progress.get(v, 0) >= 1 for v in ["A","E","I","O","U"]):
        unlock("ALL_VOWELS", "Conquistador de las vocales", "Reconocer todas las vocales al menos una vez")
    if progress.get("streak", 0) >= 10:
        unlock("STREAK_10", "Racha de 10", "10 aciertos seguidos")
    if new:
        _save(progress)
    return new
