// src/pages/Arithmetic.jsx
import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/Arithmetic.css";



const API_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_PER_LABEL = 100;

// 🔹 Números + Operaciones
const MATH_CLASSES = ["0","1","2","3","4","5","6","7","8","9","+","-","*","/"];

export default function Arithmetic() {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const collectRef = useRef(null);
  const lastPredictTime = useRef(0);

  const [status, setStatus] = useState(t("Cargando"));
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [counts, setCounts] = useState({});
  const [isTrained, setIsTrained] = useState(false);
  const isTrainedRef = useRef(false);

  useEffect(() => {
    isTrainedRef.current = isTrained;
  }, [isTrained]);

  // Inicializar Mediapipe con dos manos
  useEffect(() => {
    if (!window.Hands || !window.Camera) {
      setStatus(t("Error: scripts de Mediapipe no cargados"));
      return;
    }

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(onResults);

    let camera = null;
    if (videoRef.current) {
      camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setStatus(t("Listo - coloca ambas manos frente a la cámara"));
    }

    fetchCounts();

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, []);

  const onResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas || !results?.image) return;

    const ctx = canvas.getContext("2d");
    const W = (canvas.width = results.image.width || 640);
    const H = (canvas.height = results.image.height || 480);

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(results.image, 0, 0, W, H);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      let allLandmarks = [];

      results.multiHandLandmarks.forEach((landmarks) => {
        if (window.drawConnectors && window.drawLandmarks) {
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
            color: "#06b6d4",
            lineWidth: 2,
          });
          window.drawLandmarks(ctx, landmarks, {
            color: "#06b6d4",
            lineWidth: 1,
          });
        }
        allLandmarks.push(
          landmarks.map((p) => [p.x * W, p.y * H, p.z || 0])
        );
      });

      // 🔹 Guardar landmarks en global
      window.currentLandmarks = allLandmarks.flat();

      const now = Date.now();
      if (
        isTrainedRef.current &&
        allLandmarks.length > 0 &&
        now - lastPredictTime.current > 1000
      ) {
        lastPredictTime.current = now;
        autoPredict(window.currentLandmarks);
      }

      // 🔹 Guardar muestras si estamos recolectando
      if (collectRef.current && collectRef.current.active && collectRef.current.label) {
        if (window.currentLandmarks.length >= 21) {
          fetch(`${API_URL}/upload_landmarks_math`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: collectRef.current.label,
              landmarks: window.currentLandmarks,
            }),
          });
          collectRef.current.count = (collectRef.current.count || 0) + 1;
          setProgress(collectRef.current.count);
        }
      }
    } else {
      window.currentLandmarks = null;
    }
  };

  async function autoPredict(landmarks) {
    if (!landmarks || !Array.isArray(landmarks)) return;

    try {
      const res = await fetch(`${API_URL}/predict_landmarks_math`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landmarks }),
      });

      const data = await res.json();

      if (data.status === "not_trained") {
        setStatus(t("Modelo no entrenado todavía"));
        return;
      }

      if (data.status === "ok") {
        const result = `${data.prediction} (${(data.confidence * 100).toFixed(
          1
        )}%)`;
        setPrediction(result);
        setStatus(t("Prediciendo"));
      }
    } catch (e) {
      console.error("❌ Error en predicción:", e.message);
    }
  }

  const startCollect = (label) => {
    if (collectRef.current && collectRef.current.active) return;
    collectRef.current = { active: true, label, count: 0 };
    setStatus(t("Recolectando") + " " + label);
    setProgress(0);
  };

  const stopCollect = () => {
    if (collectRef.current) {
      collectRef.current.active = false;
      collectRef.current = null;
    }
    setStatus(t("Detenido"));
    setTimeout(fetchCounts, 300);
    setProgress(0);
  };

  const handleTrain = async () => {
    setStatus(t("Entrenando modelo matemático..."));
    try {
      const res = await fetch(`${API_URL}/train_landmarks_math`, { method: "POST" });
      if (res.ok) {
        setStatus(t("Entrenado correctamente"));
        setIsTrained(true);
        if (window.currentLandmarks) {
          autoPredict(window.currentLandmarks);
        }
      } else {
        setStatus(t("Error en entrenamiento"));
        setIsTrained(false);
      }
    } catch (e) {
      setStatus(t("Error") + ": " + e.message);
      setIsTrained(false);
    }
  };

  const handleReset = async () => {
    setStatus(t("Reiniciando datos"));
    try {
      const res = await fetch(`${API_URL}/reset_math`, { method: "POST" });
      if (res.ok) {
        await fetchCounts(); // ✅ volvemos a preguntar al backend
        setPrediction(null);
        setStatus(t("Datos eliminados"));
        setIsTrained(false);
      }
    } catch (e) {
      setStatus(t("Error al reiniciar") + ": " + e.message);
      setIsTrained(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await fetch(`${API_URL}/count_math`);
      const data = await res.json();
      setCounts(data || {});
    } catch (e) {
      console.error("❌ Error al obtener conteos:", e.message);
    }
  };

  return (
    <div className="container">
      <div className="left">
        <div className="card-title">🧮 {t("Operaciones Aritméticas con Señas")}</div>
        <p>{t("Aquí podrás practicar números y operaciones básicas con ambas manos")}</p>

        <div className="video-wrap">
          <video ref={videoRef} autoPlay playsInline muted></video>
          <canvas ref={canvasRef} className="overlay-canvas"></canvas>
        </div>

        <div className="controls">
          <button className="button" onClick={handleTrain}>
            {t("Entrenar")}
          </button>
          <button className="button red" onClick={stopCollect}>
            {t("Detener")}
          </button>
          <button className="button gray" onClick={handleReset}>
            {t("Eliminar datos")}
          </button>
        </div>

        <div className="small">
          {t("Estado")}: {status}{" "}
          {progress > 0 && `- ${progress}/${MAX_PER_LABEL}`}
        </div>

        <div className="prediction-box">{prediction || "-"}</div>
      </div>

      <div className="right">
        <div className="card-title">{t("Recolección")}</div>
        <div className="small">
          {t("Recolecta hasta")} {MAX_PER_LABEL} {t("muestras por clase")}
        </div>

        {MATH_CLASSES.map((label) => {
          const current = counts[label] || 0;
          const pct = Math.round((current / MAX_PER_LABEL) * 100);
          return (
            <div key={label} style={{ marginTop: 12 }}>
              <div className="label-row">
                <div>
                  <strong>{label}</strong>
                </div>
                <div className="small">
                  {current}/{MAX_PER_LABEL}
                </div>
              </div>
              <div className="progress">
                <div
                  className="progress-inner"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  className="button"
                  onClick={() => startCollect(label)}
                  disabled={current >= MAX_PER_LABEL}
                >
                  {t("Recolectar")} {label}
                </button>
                <button className="button red" onClick={stopCollect}>
                  {t("Detener")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
v
