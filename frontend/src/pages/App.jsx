// src/pages/App.jsx
import React, { useRef, useEffect } from "react";
import { useTrainer } from "../context/TrainerContext";
import { useAchievements } from "../context/AchievementsContext";
import { toast } from "react-hot-toast";
import { speak } from "../utils/speech";
import { useTranslation } from "react-i18next";
import "../styles/app.css";
import "../locales/i18n";

const VOCALS = ["A", "E", "I", "O", "U"];
const MAX_PER_LABEL = 100;
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const collectRef = useRef(null);
  const lastPredictTime = useRef(0);

  // funciones / estados provistos por useTrainer (asegúrate que tu context los exporte)
  const {
    status,
    prediction,
    counts,
    progress,
    setProgress,
    autoPredict,
    handleTrain,
    handleReset,
    fetchCounts,
    isTrainedRef,
  } = useTrainer();

  const { registerVowel, updateAchievements } = useAchievements();

  useEffect(() => {
    if (!window.Hands || !window.Camera) {
      console.error("❌ Scripts de Mediapipe no cargados");
      return;
    }

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(onResults);

    let camera = null;
    if (videoRef.current) {
      camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    fetchCounts();

    return () => {
      if (camera) camera.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas || !results?.image) return;

    const ctx = canvas.getContext("2d");
    const W = (canvas.width = results.image.width || 640);
    const H = (canvas.height = results.image.height || 480);

    ctx.clearRect(0, 0, W, H);
    try {
      ctx.drawImage(results.image, 0, 0, W, H);
    } catch (e) {
      console.warn("Error al dibujar en canvas:", e);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

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

      const scaled = landmarks.map((p) => [p.x * W, p.y * H, p.z || 0]);
      window.currentLandmarks = scaled;

      const now = Date.now();
      if (
        isTrainedRef?.current &&
        scaled.length === 21 &&
        now - lastPredictTime.current > 800
      ) {
        lastPredictTime.current = now;
        autoPredict(scaled);
      }

      if (
        collectRef.current &&
        collectRef.current.active &&
        collectRef.current.label
      ) {
        if (scaled.length === 21) {
          fetch(`${API_URL}/upload_landmarks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: collectRef.current.label,
              landmarks: scaled,
            }),
          }).catch((err) => console.error("upload error", err));
          collectRef.current.count = (collectRef.current.count || 0) + 1;
          setProgress(collectRef.current.count);
        }
      }
    } else {
      window.currentLandmarks = null;
    }
  };

  useEffect(() => {
    if (prediction && VOCALS.includes(prediction)) {
      // registra vocal y muestra notificación
      try {
        registerVowel(prediction);
      } catch (err) {
        console.warn("registerVowel falló:", err);
      }
      toast.success(`🎉 ${t("Logro desbloqueado")}: ${prediction}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction]);

  const startCollect = (label) => {
    if (collectRef.current && collectRef.current.active) return;
    collectRef.current = { active: true, label, count: 0 };
    try {
      speak?.(`Recolectando la vocal ${label}`);
    } catch {}
    setProgress(0);
  };

  const stopCollect = () => {
    if (collectRef.current) {
      collectRef.current.active = false;
      collectRef.current = null;
    }
    setTimeout(fetchCounts, 300);
    setProgress(0);
  };

  return (
    <div className="container">
      <div className="left">
        <div className="card-title">{t("Reconocimiento de Señas")}</div>

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
          {t("Estado")}: {status} {progress > 0 && `- ${progress}/${MAX_PER_LABEL}`}
        </div>

        <div className="prediction-box">{prediction || "-"}</div>
      </div>

      <div className="right">
        <div className="card-title">{t("Recolección")}</div>
        <div className="small">
          {t("Recolecta hasta")} {MAX_PER_LABEL} {t("muestras por clase")}
        </div>

        {VOCALS.map((v) => {
          const current = counts?.[v] || 0;
          const pct = Math.round((current / MAX_PER_LABEL) * 100);
          return (
            <div key={v} style={{ marginTop: 12 }}>
              <div className="label-row">
                <div>
                  <strong>{v}</strong>
                </div>
                <div className="small">
                  {current}/{MAX_PER_LABEL}
                </div>
              </div>
              <div className="progress">
                <div className="progress-inner" style={{ width: `${pct}%` }}></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="button" onClick={() => startCollect(v)} disabled={current >= MAX_PER_LABEL}>
                  {t("Recolectar")} {v}
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
