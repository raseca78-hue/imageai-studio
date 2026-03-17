import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || text.length < 100) {
      return NextResponse.json({ error: 'El contrato es demasiado corto' }, { status: 400 })
    }

    // Limitar texto para no exceder tokens
    const contractText = text.slice(0, 8000)

    const zai = await ZAI.create()

    const prompt = `Eres un abogado experto en análisis de contratos. Analiza el siguiente contrato y devuelve ÚNICAMENTE un JSON válido (sin markdown, sin explicaciones) con esta estructura exacta:

{
  "resumen": "Resumen de 2-3 frases de qué trata el contrato",
  "riesgos": [
    {"clausula": "Nombre de la cláusula", "explicacion": "Por qué es riesgosa", "severidad": "alta|media|baja"}
  ],
  "recomendaciones": ["Recomendación 1", "Recomendación 2"],
  "puntos_clave": ["Punto importante 1", "Punto importante 2"]
}

Analiza y detecta:
- Cláusulas abusivas o desequilibradas
- Penalizaciones excesivas
- Renuncias de derechos
- Cláusulas de confidencialidad excesivas
- Jurisdicción desfavorable
- Plazos excesivos o indefinidos
- Cláusulas de rescisión injustas
- Responsabilidades desproporcionadas
- Ausencia de cláusulas importantes

CONTRATO A ANALIZAR:
---
${contractText}
---

Responde SOLO con el JSON, nada más:`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Eres un abogado experto. Responde ÚNICAMENTE con JSON válido, sin markdown ni explicaciones.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Limpiar la respuesta para obtener solo el JSON
    let jsonStr = responseText.trim()

    // Quitar markdown code blocks si existen
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?/g, '')
    }

    // Encontrar el JSON
    const jsonStart = jsonStr.indexOf('{')
    const jsonEnd = jsonStr.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'Error al procesar el análisis' }, { status: 500 })
    }

    jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1)

    const analysis = JSON.parse(jsonStr)

    // Validar estructura
    if (!analysis.resumen || !Array.isArray(analysis.riesgos)) {
      return NextResponse.json({ error: 'Análisis incompleto' }, { status: 500 })
    }

    return NextResponse.json(analysis)

  } catch (error: any) {
    console.error('Error analyzing contract:', error)

    if (error.message?.includes('JSON')) {
      return NextResponse.json({ error: 'Error al procesar el análisis. Intenta de nuevo.' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Error del servidor. Intenta más tarde.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'ContractAI - Analizador de Contratos',
    version: '1.0.0'
  })
}
