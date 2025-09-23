import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as cam from "@mediapipe/camera_utils";
import * as hands from "@mediapipe/hands";
import {
  uploadOperationSample,
  trainOperationModel,
} from "../services/operations";

export default function OperationTrainer() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [collecting, setCollecting] = useState(null);
  const [progress, setProgress] = useState(0);
  const countsRef = useRef({});
  const lastSentRef = useRef(0);

  useEffect(() => {
    const handsDetector = new hands.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsDetector.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    handsDetector.onResults((results) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks.length > 0 && collecting) {
        const landmarks = results.multiHandLandmarks[0];
        const now = Date.now();

        if (now - lastSentRef.current > 200) {
          const count = countsRef.current[collecting] || 0;
          if (count < 100) {
            const allLandmarks = landmarks.flatMap((lm) => [lm.x, lm.y, lm.z]);
            uploadOperationSample(collecting, allLandmarks).catch((err) =>
              console.error("upload error", err)
            );
            countsRef.current[collecting] = count + 1;
            setProgress(count + 1);
            lastSentRef.current = now;
          } else {
            setCollecting(null);
            alert(`✅ Se recolectaron 100 muestras para ${collecting}`);
            countsRef.current[collecting] = 0;
          }
        }
      }
    });

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await handsDetector.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [collecting]);

  const startCollecting = (operator) => {
    setCollecting(operator);
    setProgress(0);
    countsRef.current[operator] = countsRef.current[operator] || 0;
  };

  return (
    <div>
      <h2>Entrenar Operaciones Matemáticas</h2>
      <Webcam ref={webcamRef} className="w-80 h-60" />
      <canvas ref={canvasRef} className="w-80 h-60 border" />
      <div className="mt-2">
        {["+", "-", "*", "/"].map((op) => (
          <button
            key={op}
            className="bg-green-500 text-white px-4 py-2 m-1 rounded"
            onClick={() => startCollecting(op)}
            disabled={collecting !== null}
          >
            Recolectar {op}
          </button>
        ))}
      </div>
      {collecting && <p>Recolectando {collecting}: {progress}/100</p>}
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
        onClick={() => trainOperationModel()}
      >
        Entrenar Modelo
      </button>
    </div>
  );
}
