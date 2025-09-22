import React, { useRef, useEffect, useState } from "react";
import { useAchievements } from "../context/AchievementsContext";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next"; // 👈 importamos traducción
import "../styles/app.css";
import "../locales/i18n";

const VOCALS = ["A", "E", "I", "O", "U"];
const MAX_PER_LABEL = 100;
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const { t } = useTranslation(); // 👈 inicializamos traducción
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [counts, setCounts] = useState({});
  const collectRef = useRef(null);
  const [status, setStatus] = useState(t("loading"));
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const lastPredictTime = useRef(0);

  const [isTrained, setIsTrained] = useState(false);
  const isTrainedRef = useRef(false);

  const { updateAchievements } = useAchievements();

  useEffect(() => {
    isTrainedRef.current = isTrained;
  }, [isTrained]);

  useEffect(() => {
    if (!window.Hands || !window.Camera) {
      setStatus(t("error_mediapipe"));
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
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setStatus(t("ready_hand"));
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
    try {
      ctx.drawImage(results.image, 0, 0, W, H);
    } catch (e) {
      console.warn("Error al dibujar imagen en canvas:", e);
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
        isTrainedRef.current &&
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
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 21)
      return;

    try {
      const res = await fetch(`${API_URL}/predict_landmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landmarks }),
      });

      const data = await res.json();

      if (data.status === "not_trained") {
        setStatus(t("not_trained"));
        return;
      }

      if (data.status === "ok") {
        const result = `${data.prediction} (${(data.confidence * 100).toFixed(
          1
        )}%)`;
        setPrediction(result);
        setStatus(t("predicting"));

        if (data.new_achievements?.length > 0) {
          data.new_achievements.forEach((ach) => {
            toast.success(`${t("achievement_unlocked")}: ${ach}`);
          });
        }

        if (data.progress) {
          const unlockedKeys = Object.keys(data.progress).filter(
            (k) => data.progress[k] === true
          );
          updateAchievements(unlockedKeys);
        }
      }
    } catch (e) {
      console.error("❌ Error en predicción:", e.message);
    }
  }

  async function fetchCounts() {
    try {
      const res = await fetch(`${API_URL}/count`);
      const j = await res.json();
      setCounts(j || {});
    } catch (e) {
      console.error("❌ Error al traer conteos:", e);
    }
  }

  const startCollect = (label) => {
    if (collectRef.current && collectRef.current.active) return;
    collectRef.current = { active: true, label, count: 0 };
    setStatus(`${t("collecting")} ${label}`);
    setProgress(0);
  };

  const stopCollect = () => {
    if (collectRef.current) {
      collectRef.current.active = false;
      collectRef.current = null;
    }
    setStatus(t("stopped"));
    setTimeout(fetchCounts, 300);
    setProgress(0);
  };

  const handleTrain = async () => {
    setStatus(t("training"));
    try {
      const res = await fetch(`${API_URL}/train_landmarks`, { method: "POST" });
      const j = await res.json();
      if (res.ok) {
        setStatus(t("trained_success"));
        setIsTrained(true);

        if (window.currentLandmarks && window.currentLandmarks.length === 21) {
          autoPredict(window.currentLandmarks);
        }
      } else {
        setStatus(t("error_training") + ": " + (j.error || ""));
        setIsTrained(false);
      }
    } catch (e) {
      setStatus(t("error_training") + ": " + e.message);
      setIsTrained(false);
    }
  };

  const handleReset = async () => {
    setStatus(t("resetting"));
    try {
      const res = await fetch(`${API_URL}/reset`, { method: "POST" });
      if (res.ok) {
        setCounts({});
        setPrediction(null);
        setStatus(t("data_deleted"));
        setIsTrained(false);
      }
    } catch (e) {
      setStatus(t("error_reset") + ": " + e.message);
      setIsTrained(false);
    }
  };

  return (
    <div className="container">
      <div className="left">
        <div className="card-title">{t("sign_recognition")}</div>

        <div className="video-wrap">
          <video ref={videoRef} autoPlay playsInline muted></video>
          <canvas ref={canvasRef} className="overlay-canvas"></canvas>
        </div>

        <div className="controls">
          <button className="button" onClick={handleTrain}>
            {t("train")}
          </button>
          <button className="button red" onClick={stopCollect}>
            {t("stop")}
          </button>
          <button className="button gray" onClick={handleReset}>
            {t("delete_data")}
          </button>
        </div>

        <div className="small">
          {t("status")}: {status}{" "}
          {progress > 0 && `- ${progress}/${MAX_PER_LABEL}`}
        </div>

        <div className="prediction-box">{prediction || "-"}</div>
      </div>

      <div className="right">
        <div className="card-title">{t("collection")}</div>
        <div className="small">{t("collect_up_to", { max: MAX_PER_LABEL })}</div>

        {VOCALS.map((v) => {
          const current = counts[v] || 0;
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
                <div
                  className="progress-inner"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  className="button"
                  onClick={() => startCollect(v)}
                  disabled={current >= MAX_PER_LABEL}
                >
                  {t("collect")} {v}
                </button>
                <button className="button red" onClick={stopCollect}>
                  {t("stop")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
