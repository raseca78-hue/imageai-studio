import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/image-generator'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'

// Planes disponibles
const PLAN_CREDITS: Record<string, number> = {
  FREE: 1,
  PRO: 100,
  BUSINESS: 999999
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Generando imagen...')

    // Verificar/crear usuario
    const token = await getToken({ req: request })
    let userId = token?.id as string | null

    if (!userId) {
      const anonUser = await db.user.create({
        data: {
          email: `user_${Date.now()}@temp.com`,
          name: 'Usuario',
          plan: 'FREE',
          credits: 1,
          creditsUsed: 0
        }
      })
      userId = anonUser.id
    }

    // Obtener datos
    const body = await request.json()
    const { prompt, size = '512x512', style = 'none' } = body

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Escribe una descripción' }, { status: 400 })
    }

    // Verificar créditos
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.credits < 1) {
      return NextResponse.json({ 
        error: 'Sin créditos', 
        needsUpgrade: true 
      }, { status: 402 })
    }

    // Generar imagen
    const result = await generateImage(prompt.trim(), size, style)

    if (!result.success || !result.imageBase64) {
      return NextResponse.json({ 
        error: result.error || 'Error al generar' 
      }, { status: 500 })
    }

    // Descontar crédito
    await db.user.update({
      where: { id: userId },
      data: { 
        credits: { decrement: 1 },
        creditsUsed: { increment: 1 }
      }
    })

    const updatedUser = await db.user.findUnique({ where: { id: userId } })

    return NextResponse.json({
      success: true,
      imageBase64: result.imageBase64,
      remainingCredits: updatedUser?.credits || 0
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Error inesperado' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ images: [] })
}
