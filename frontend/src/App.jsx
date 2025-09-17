import React, { useRef, useEffect, useState } from 'react'

const VOCALS = ['A', 'E', 'I', 'O', 'U']
const MAX_PER_LABEL = 100

// URL del backend desde .env
const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [counts, setCounts] = useState({})
  const collectRef = useRef(null)
  const [status, setStatus] = useState('Cargando...')
  const [progress, setProgress] = useState(0)
  const [prediction, setPrediction] = useState(null)
  const lastPredictTime = useRef(0)

  // Inicializa Mediapipe
  useEffect(() => {
    if (!window.Hands || !window.Camera) {
      setStatus("Error: scripts de Mediapipe no cargados")
      return
    }

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    })

    hands.onResults(onResults)

    if (videoRef.current) {
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current })
        },
        width: 640,
        height: 480,
      })
      camera.start()
      setStatus('Listo - coloca la mano frente a la cámara')
    }

    fetchCounts()
  }, [])

  // Procesa resultados
  const onResults = (results) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = (canvas.width = results.image.width)
    const H = (canvas.height = results.image.height)

    ctx.clearRect(0, 0, W, H)
    try {
      ctx.drawImage(results.image, 0, 0, W, H)
    } catch (e) {}

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0]

      if (window.drawConnectors && window.drawLandmarks) {
        window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
          color: '#06b6d4',
          lineWidth: 2,
        })
        window.drawLandmarks(ctx, landmarks, {
          color: '#06b6d4',
          lineWidth: 1,
        })
      }

      const scaled = landmarks.map((p) => [p.x * W, p.y * H, p.z || 0])
      window.currentLandmarks = scaled

      const now = Date.now()
      if (scaled.length === 21 && now - lastPredictTime.current > 600) {
        lastPredictTime.current = now
        autoPredict(scaled)
      }

      if (collectRef.current && collectRef.current.active && collectRef.current.label) {
        if (scaled.length === 21) {
          fetch(`${API_URL}/upload_landmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label: collectRef.current.label, landmarks: scaled }),
          })
          collectRef.current.count = (collectRef.current.count || 0) + 1
          setProgress(collectRef.current.count)
        }
      }
    } else {
      window.currentLandmarks = null
    }
  }

  // Llama al backend para predecir
  async function autoPredict(landmarks) {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 21) {
      return // No mandes nada inválido
    }

    try {
      const res = await fetch(`${API_URL}/predict_landmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks }),
      })
      const j = await res.json()
      if (res.ok) {
        setPrediction(j.prediction + ' (' + (j.confidence * 100).toFixed(1) + '%)')
      } else {
        setStatus('Error: ' + (j.error || 'Bad Request'))
      }
    } catch (e) {
      setStatus('Error: ' + e.message)
    }
  }

  // Trae los conteos
  async function fetchCounts() {
    try {
      const res = await fetch(`${API_URL}/count`)
      const j = await res.json()
      setCounts(j || {})
    } catch (e) {}
  }

  const startCollect = (label) => {
    if (collectRef.current && collectRef.current.active) return
    collectRef.current = { active: true, label, count: 0 }
    setStatus('Recolectando ' + label)
    setProgress(0)
  }

  const stopCollect = () => {
    if (collectRef.current) {
      collectRef.current.active = false
      collectRef.current = null
    }
    setStatus('Detenido')
    setTimeout(fetchCounts, 300)
    setProgress(0)
  }

  const handleTrain = async () => {
    setStatus('Entrenando...')
    try {
      const res = await fetch(`${API_URL}/train_landmarks`, { method: 'POST' })
      const j = await res.json()
      if (res.ok) setStatus('Entrenado correctamente')
      else setStatus('Error: ' + (j.error || 'Error en entrenamiento'))
    } catch (e) {
      setStatus('Error: ' + e.message)
    }
  }

  const handleReset = async () => {
    setStatus('Reiniciando datos...')
    try {
      const res = await fetch(`${API_URL}/reset`, { method: 'POST' })
      if (res.ok) {
        setCounts({})
        setPrediction(null)
        setStatus('Datos eliminados')
      }
    } catch (e) {
      setStatus('Error al reiniciar: ' + e.message)
    }
  }

  return (
    <div className="container">
      <div className="left">
        <div className="card-title">Reconocimiento de Señas</div>
        <div className="video-wrap">
          <video ref={videoRef} autoPlay playsInline muted></video>
          <canvas ref={canvasRef} className="overlay-canvas"></canvas>
        </div>
        <div className="controls">
          <button className="button" onClick={handleTrain}>Entrenar</button>
          <button className="button red" onClick={stopCollect}>Detener</button>
          <button className="button gray" onClick={handleReset}>Eliminar Datos</button>
        </div>
        <div className="small">
          Estado: {status} {progress > 0 && `- ${progress}/${MAX_PER_LABEL}`}
        </div>
        <div className="prediction-box">{prediction || '-'}</div>
      </div>

      <div className="right">
        <div className="card-title">Recolección</div>
        <div className="small">Recolecta hasta {MAX_PER_LABEL} muestras por clase</div>
        {VOCALS.map((v) => {
          const current = counts[v] || 0
          const pct = Math.round((current / MAX_PER_LABEL) * 100)
          return (
            <div key={v} style={{ marginTop: 12 }}>
              <div className="label-row">
                <div><strong>{v}</strong></div>
                <div className="small">{current}/{MAX_PER_LABEL}</div>
              </div>
              <div className="progress">
                <div className="progress-inner" style={{ width: `${pct}%` }}></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="button" onClick={() => startCollect(v)} disabled={current >= MAX_PER_LABEL}>
                  Recolectar {v}
                </button>
                <button className="button red" onClick={stopCollect}>Detener</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
