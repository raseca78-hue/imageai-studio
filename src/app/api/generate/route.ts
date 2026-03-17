import { NextRequest, NextResponse } from 'next/server'

// API simple para generar imágenes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: 'Escribe una descripción' }, { status: 400 })
    }

    // Usar Pollinations.ai - GRATIS
    const seed = Math.floor(Math.random() * 1000000)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true`

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      remainingCredits: 0
    })

  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
