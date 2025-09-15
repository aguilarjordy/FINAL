Proyecto: Reconocimiento de Señas - React (Vite) + Flask (temporal, sin persistencia)

Estructura:
- frontend/   <- proyecto Vite + React
- backend/    <- Flask minimal (no guarda archivos)

Instrucciones rápidas:

1) Frontend
  cd frontend
  npm install
  npm run dev
  (Esto levanta Vite en http://localhost:5173)

2) Backend
  cd backend
  python -m venv venv
  source venv/bin/activate   # o venv\Scripts\activate en Windows
  pip install -r requirements.txt
  python app.py
  (Backend en http://localhost:5000)

Notas importantes:
- El frontend NO usa localStorage ni sessionStorage -> al recargar la página el estado se pierde (como pediste).
- El backend recibe imágenes en /api/upload pero NO las guarda en disco. Solo mantiene contadores en memoria que se pierden al reiniciar el proceso.
- Si quieres que el backend tampoco mantenga contadores, puedes eliminar o comentar la variable in_memory_counts y su uso.

Si quieres, puedo:
- Añadir autenticación, guardar dataset en disco (opcional), o integrar entrenamiento en el backend.
- Crear un script para empaquetar y ejecutar todo con Docker.
