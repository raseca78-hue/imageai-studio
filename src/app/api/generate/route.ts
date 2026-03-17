import { NextRequest, NextResponse } from 'next/server'
import { generateImage, enhancePrompt, IMAGE_SIZES } from '@/lib/image-generator'
import { deductCredits, getUserWithCredits } from '@/lib/auth'
import { db } from '@/lib/db'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    // Para demo, permitir usuarios anónimos con límites
    let userId = token?.id as string | null
    
    // Si no hay usuario, crear uno temporal
    if (!userId) {
      const anonymousUser = await db.user.create({
        data: {
          email: `anon_${Date.now()}@temp.com`,
          name: 'Usuario Anónimo',
          plan: 'FREE',
          credits: 3,
          creditsUsed: 0
        }
      })
      userId = anonymousUser.id
    }

    const body = await request.json()
    const { prompt, size = '1024x1024', style = 'none' } = body

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'El prompt debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    // Verificar tamaño válido
    const validSize = IMAGE_SIZES.find(s => s.value === size)
    if (!validSize) {
      return NextResponse.json(
        { error: 'Tamaño de imagen no válido' },
        { status: 400 }
      )
    }

    // Verificar créditos
    const user = await getUserWithCredits(userId)
    if (!user || user.credits < 1) {
      return NextResponse.json(
        { error: 'No tienes créditos suficientes. ¡Actualiza tu plan!', needsUpgrade: true },
        { status: 402 }
      )
    }

    // Mejorar prompt
    const enhancedPrompt = enhancePrompt(prompt.trim())

    // Generar imagen
    const result = await generateImage(enhancedPrompt, size, style)

    if (!result.success || !result.imageBase64) {
      return NextResponse.json(
        { error: result.error || 'Error al generar la imagen' },
        { status: 500 }
      )
    }

    // Descontar créditos
    await deductCredits(userId, 1)

    // Guardar en base de datos
    const image = await db.image.create({
      data: {
        userId,
        prompt: prompt.trim(),
        enhancedPrompt,
        imageBase64: result.imageBase64.substring(0, 100) + '...',
        imageSize: size,
        style
      }
    })

    // Registrar actividad
    await db.activity.create({
      data: {
        userId,
        type: 'generate',
        description: `Generó imagen: "${prompt.substring(0, 50)}..."`,
        credits: 1
      }
    })

    const updatedUser = await getUserWithCredits(userId)

    return NextResponse.json({
      success: true,
      imageId: image.id,
      imageBase64: result.imageBase64,
      prompt: enhancedPrompt,
      size,
      remainingCredits: updatedUser?.credits || 0
    })

  } catch (error: any) {
    console.error('Error en generate API:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Obtener historial de imágenes
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
