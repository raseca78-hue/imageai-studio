import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { getUserWithCredits, deductCredits, PLAN_CONFIG } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'

// Tamaños permitidos
const ALLOWED_SIZES = ['1024x1024', '768x1344', '1344x768']

// Estilos
const IMAGE_STYLES: Record<string, string> = {
  'none': '',
  'realistic': 'photorealistic, highly detailed, professional photography, 8k',
  'digital-art': 'digital art, vibrant colors, trending on artstation',
  'anime': 'anime style, manga, high quality, detailed',
  'oil-painting': 'oil painting, classical masterpiece, rich textures',
  '3d-render': '3D render, octane render, highly detailed',
  'cyberpunk': 'cyberpunk style, neon lights, futuristic, dark atmosphere',
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Generate: Iniciando...')

    // Verificar usuario
    const token = await getToken({ req: request })
    let userId = token?.id as string | null

    if (!userId) {
      const anonUser = await db.user.create({
        data: {
          email: `anon_${Date.now()}@temp.com`,
          name: 'Usuario',
          plan: 'FREE',
          credits: PLAN_CONFIG.FREE.credits,
          creditsUsed: 0
        }
      })
      userId = anonUser.id
      console.log('👤 Usuario anónimo creado')
    }

    // Obtener datos
    const body = await request.json()
    const { prompt, size = '1024x1024', style = 'none' } = body

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Describe la imagen (mínimo 3 caracteres)' }, { status: 400 })
    }

    // Verificar créditos
    const user = await getUserWithCredits(userId)
    if (!user || user.credits < 1) {
      return NextResponse.json({ 
        error: 'Sin créditos. ¡Actualiza tu plan!', 
        needsUpgrade: true 
      }, { status: 402 })
    }

    // Construir prompt final
    const stylePrompt = IMAGE_STYLES[style] || ''
    const finalPrompt = stylePrompt 
      ? `${prompt.trim()}, ${stylePrompt}`
      : prompt.trim()

    console.log('📝 Prompt:', finalPrompt.substring(0, 80) + '...')

    // Verificar tamaño
    const validSize = ALLOWED_SIZES.includes(size) ? size : '1024x1024'

    // GENERAR IMAGEN CON Z-AI SDK
    console.log('🎨 Generando imagen...')
    
    try {
      const zai = await ZAI.create()
      
      const response = await zai.images.generations.create({
        prompt: finalPrompt,
        size: validSize as '1024x1024' | '768x1344' | '1344x768'
      })

      const imageBase64 = response.data[0]?.base64

      if (!imageBase64) {
        throw new Error('No se generó la imagen')
      }

      console.log('✅ ¡Imagen generada!')

      // Descontar crédito
      await deductCredits(userId, 1)

      // Actualizar usuario
      const updatedUser = await getUserWithCredits(userId)

      // Guardar referencia
      try {
        await db.image.create({
          data: {
            userId,
            prompt: prompt.trim(),
            enhancedPrompt: finalPrompt,
            imageBase64: '[generada]',
            imageSize: validSize,
            style
          }
        })
      } catch (e) {
        console.log('⚠️ No se guardó en BD')
      }

      return NextResponse.json({
        success: true,
        imageBase64,
        prompt: finalPrompt,
        size: validSize,
        remainingCredits: updatedUser?.credits || 0
      })

    } catch (sdkError: any) {
      console.error('❌ Error SDK:', sdkError)
      
      return NextResponse.json({ 
        error: 'El generador de imágenes no está disponible. Por favor, contacta al administrador.' 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Error general:', error)
    return NextResponse.json({ 
      error: 'Error inesperado. Intenta de nuevo.' 
    }, { status: 500 })
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
  } catch {
    return NextResponse.json({ images: [] })
  }
}
