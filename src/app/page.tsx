'use client'

import { useState } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!prompt.trim()) {
      setError('Escribe una descripción')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })
      
      const data = await res.json()
      
      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
      } else {
        setError(data.error || 'Error al generar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `imagen-${Date.now()}.png`
    a.target = '_blank'
    a.click()
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            ✨ ImageAI Studio
          </h1>
          <p style={{ color: '#aaa' }}>
            Genera imágenes con IA - 100% GRATIS
          </p>
        </div>

        {/* Input Card */}
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '16px', 
          padding: '24px',
          marginBottom: '20px'
        }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Describe tu imagen:
          </label>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: un gato astronauta flotando en el espacio..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '16px',
              marginBottom: '15px',
              resize: 'vertical'
            }}
            disabled={loading}
          />

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              background: loading ? '#666' : 'linear-gradient(90deg, #7c3aed, #ec4899)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            {loading ? '⏳ Generando...' : '🎨 Generar Imagen'}
          </button>

          {error && (
            <p style={{ color: '#ff6b6b', marginTop: '10px', textAlign: 'center' }}>
              {error}
            </p>
          )}
        </div>

        {/* Result */}
        {imageUrl && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '16px', 
            padding: '20px',
            textAlign: 'center'
          }}>
            <img 
              src={imageUrl} 
              alt="Imagen generada"
              style={{ 
                width: '100%', 
                maxWidth: '512px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            />
            <button
              onClick={download}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                border: '2px solid white',
                borderRadius: '8px',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              📥 Descargar Imagen
            </button>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '14px' }}>
          Powered by Pollinations AI • 100% Gratuito
        </p>
      </div>
    </main>
  )
}
