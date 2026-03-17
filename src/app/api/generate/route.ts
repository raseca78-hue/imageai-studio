import { NextRequest, NextResponse } from 'next/server'
import { generateImage, enhancePrompt, IMAGE_SIZES } from '@/lib/image-generator'
import { deductCredits, getUserWithCredits } from '@/lib/auth'
import { db } from '@/lib/db'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando generación...')
    
    const token = await getToken({ req: request })
    let userId = token?.id as string | null
    
    // Si no hay usuario, crear uno temporal
    if (!userId) {
      const anonymousUser = await db.user.create({
        data: {
          email: `anon_${Date.now()}@temp.com`,
          name: 'Usuario',
          plan: 'FREE',
          credits: 1,
          creditsUsed: 0
        }
      })
      userId = anonymousUser.id
    }

    const body = await request.json()
    const { prompt, size = '1024x1024', style = 'none' } = body

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Escribe una descripción de al menos 3 caracteres' },
        { status: 400 }
      )
    }

    // Verificar créditos
    const user = await getUserWithCredits(userId)
    if (!user || user.credits < 1) {
      return NextResponse.json(
        { error: 'No tienes créditos. ¡Actualiza tu plan!', needsUpgrade: true },
        { status: 402 }
      )
    }

    // Mejorar prompt
    const enhancedPrompt = enhancePrompt(prompt.trim())

    // Generar imagen
    console.log('🎨 Generando imagen...')
    const result = await generateImage(enhancedPrompt, size, style)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al generar' },
        { status: 500 }
      )
    }

    // Descontar créditos
    await deductCredits(userId, 1)

    // Guardar referencia en BD
    try {
      await db.image.create({
        data: {
          userId,
          prompt: prompt.trim(),
          enhancedPrompt,
          imageBase64: result.imageUrl || '',
          imageSize: size,
          style
        }
      })
    } catch (e) {
      console.log('No se guardó en BD, pero OK')
    }

    const updatedUser = await getUserWithCredits(userId)

    console.log('✅ Imagen generada!')

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      imageBase64: result.imageBase64,
      prompt: enhancedPrompt,
      size,
      remainingCredits: updatedUser?.credits || 0
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error inesperado. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}

// GET - Historial
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    const userId = token?.id as string

    if (!userId) {
      return NextResponse.json({ images: [] })
    }

    const images = await db.image.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ images })

  } catch (error: any) {
    return NextResponse.json({ images: [] })
  }
}
