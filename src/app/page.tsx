'use client'

import { useState } from 'react'

type AnalysisResult = {
  resumen: string
  riesgos: { clausula: string; explicacion: string; severidad: 'alta' | 'media' | 'baja' }[]
  recomendaciones: string[]
  puntos_clave: string[]
}

export default function Home() {
  const [contractText, setContractText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  const analyzeContract = async () => {
    if (!contractText.trim() || contractText.length < 100) {
      setError('Pega un contrato de al menos 100 caracteres')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: contractText.trim() })
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch {
      setError('Error al analizar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'alta': return '#ef4444'
      case 'media': return '#f59e0b'
      default: return '#22c55e'
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>
            📋 ContractAI
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Analiza contratos y detecta cláusulas peligrosas con IA
          </p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
            Ahorra cientos en abogados • Resultados en segundos
          </p>
        </div>

        {/* Input Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid #334155'
        }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '1.1rem' }}>
            📄 Pega tu contrato aquí:
          </label>

          <textarea
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            placeholder="Copia y pega el texto completo del contrato que quieres analizar. La IA detectará cláusulas abusivas, riesgos ocultos y te dará recomendaciones..."
            style={{
              width: '100%',
              minHeight: '250px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #475569',
              background: '#0f172a',
              color: 'white',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'vertical',
              marginBottom: '16px'
            }}
            disabled={loading}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>
              {contractText.length} caracteres
            </span>
            <button
              onClick={analyzeContract}
              disabled={loading || contractText.length < 100}
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '10px',
                background: loading || contractText.length < 100
                  ? '#475569'
                  : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                color: 'white',
                cursor: loading || contractText.length < 100 ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s'
              }}
            >
              {loading ? '⏳ Analizando...' : '🔍 Analizar Contrato'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#f87171', marginTop: '16px', padding: '12px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>
              {error}
            </p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Summary */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid #334155'
            }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#60a5fa' }}>
                📝 Resumen del Contrato
              </h2>
              <p style={{ lineHeight: '1.7', color: '#e2e8f0' }}>{result.resumen}</p>
            </div>

            {/* Key Points */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid #334155'
            }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#60a5fa' }}>
                🔑 Puntos Clave
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {result.puntos_clave.map((punto, i) => (
                  <li key={i} style={{ padding: '8px 0', paddingLeft: '24px', position: 'relative', color: '#e2e8f0' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#22c55e' }}>✓</span>
                    {punto}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid #334155'
            }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#f87171' }}>
                ⚠️ Riesgos Detectados ({result.riesgos.length})
              </h2>
              {result.riesgos.map((riesgo, i) => (
                <div key={i} style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  borderLeft: `4px solid ${getSeveridadColor(riesgo.severidad)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#f1f5f9' }}>{riesgo.clausula}</span>
                    <span style={{
                      background: getSeveridadColor(riesgo.severidad),
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {riesgo.severidad}
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>{riesgo.explicacion}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid #334155'
            }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#4ade80' }}>
                💡 Recomendaciones
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {result.recomendaciones.map((rec, i) => (
                  <li key={i} style={{
                    padding: '12px 16px',
                    marginBottom: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '30px' }}>
              ⚖️ Este análisis es orientativo. Para decisiones legales importantes, consulta con un abogado.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
