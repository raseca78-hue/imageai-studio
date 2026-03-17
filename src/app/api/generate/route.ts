import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: 'Escribe una descripción más larga' }, { status: 400 })
    }

    // Generar URL de Pollinations.ai - 100% GRATIS
    const seed = Math.floor(Math.random() * 10000000)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true&enhance=true`

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
