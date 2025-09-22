import React, { useRef, useEffect } from "react";
import { useTrainer } from "../context/TrainerContext"; // ⬅️ Nuevo contexto
import { speak } from "../utils/speech"; // ⬅️ Voz
import "../styles/app.css";

const VOCALS = ["A", "E", "I", "O", "U"];
const MAX_PER_LABEL = 100;
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    isTrained,
  } = useTrainer();

  const collectRef = useRef(null);
  const lastPredictTime = useRef(0);

  // 🔹 Ref sincronizado con isTrained
  const isTrainedRef = useRef(isTrained);
  useEffect(() => {
    isTrainedRef.current = isTrained;
  }, [isTrained]);

  // Inicializa Mediapipe
  useEffect(() => {
    if (!window.Hands || !window.Camera) {
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
    }

    fetchCounts();

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, []);

  // Procesa resultados Mediapipe
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
        isTrainedRef.current && // ✅ Usamos ref sincronizado
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

  const startCollect = (label) => {
    if (collectRef.current && collectRef.current.active) return;
    collectRef.current = { active: true, label, count: 0 };
    speak(`Recolectando la vocal ${label}`); // 👈 Voz al recolectar
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
      {/* Columna izquierda */}
      <div className="left">
        <div className="card-title">Reconocimiento de Señas</div>

        <div className="video-wrap">
          <video ref={videoRef} autoPlay playsInline muted></video>
          <canvas ref={canvasRef} className="overlay-canvas"></canvas>
        </div>

        <div className="controls">
          <button className="button" onClick={handleTrain}>
            Entrenar
          </button>
          <button className="button red" onClick={stopCollect}>
            Detener
          </button>
          <button className="button gray" onClick={handleReset}>
            Eliminar Datos
          </button>
        </div>

        <div className="small">
          Estado: {status} {progress > 0 && `- ${progress}/${MAX_PER_LABEL}`}
        </div>

        <div className="prediction-box">{prediction || "-"}</div>
      </div>

      {/* Columna derecha */}
      <div className="right">
        <div className="card-title">Recolección</div>
        <div className="small">
          Recolecta hasta {MAX_PER_LABEL} muestras por clase
        </div>

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
                  Recolectar {v}
                </button>
                <button className="button red" onClick={stopCollect}>
                  Detener
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
