import ZAI from 'z-ai-web-dev-sdk'

// Tamaños disponibles para generación
export const IMAGE_SIZES = [
  { value: '1024x1024', label: 'Cuadrado (1024x1024)', description: 'Ideal para posts de Instagram' },
  { value: '768x1344', label: 'Retrato (768x1344)', description: 'Perfecto para Stories/Reels' },
  { value: '1344x768', label: 'Paisaje (1344x768)', description: 'Para YouTube, blogs' },
  { value: '864x1152', label: 'Poster (864x1152)', description: 'Para pósters y flyers' },
  { value: '1152x864', label: 'Ancho (1152x864)', description: 'Para banners web' },
  { value: '1440x720', label: 'Cinemático (1440x720)', description: 'Formato cinematográfico' },
  { value: '720x1440', label: 'Móvil (720x1440)', description: 'Para fondos de móvil' }
] as const

// Estilos predefinidos para mejor UX
export const IMAGE_STYLES = [
  { value: 'none', label: 'Sin estilo', prompt: '' },
  { value: 'realistic', label: 'Fotorrealista', prompt: 'photorealistic, highly detailed, professional photography, 8k resolution' },
  { value: 'digital-art', label: 'Arte Digital', prompt: 'digital art, vibrant colors, modern illustration, trending on artstation' },
  { value: 'anime', label: 'Anime', prompt: 'anime style, manga aesthetic, vibrant colors, detailed linework' },
  { value: 'oil-painting', label: 'Óleo', prompt: 'oil painting style, classical art, rich textures, masterpiece' },
  { value: 'watercolor', label: 'Acuarela', prompt: 'watercolor painting, soft colors, artistic, dreamy atmosphere' },
  { value: '3d-render', label: '3D Render', prompt: '3D render, octane render, highly detailed, volumetric lighting' },
  { value: 'minimalist', label: 'Minimalista', prompt: 'minimalist design, clean lines, simple shapes, modern aesthetic' },
  { value: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, futuristic, dark atmosphere' },
  { value: 'vintage', label: 'Vintage', prompt: 'vintage photography, film grain, nostalgic, retro aesthetic' }
] as const

// Generar imagen con IA
export async function generateImage(
  prompt: string,
  size: string = '1024x1024',
  style: string = 'none'
): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  try {
    const zai = await ZAI.create()
    
    // Construir prompt final con estilo
    const styleData = IMAGE_STYLES.find(s => s.value === style)
    const finalPrompt = styleData?.prompt 
      ? `${prompt}, ${styleData.prompt}`
      : prompt
    
    console.log('🎨 Generando imagen:', { prompt: finalPrompt, size })
    
    const response = await zai.images.generations.create({
      prompt: finalPrompt,
      size: size as '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440'
    })
    
    const imageBase64 = response.data[0]?.base64
    
    if (!imageBase64) {
      return { success: false, error: 'No se pudo generar la imagen' }
    }
    
    console.log('✅ Imagen generada correctamente')
    return { success: true, imageBase64 }
    
  } catch (error: any) {
    console.error('❌ Error generando imagen:', error)
    return { 
      success: false, 
      error: error.message || 'Error al generar la imagen. Por favor intenta de nuevo.' 
    }
  }
}

// Mejorar prompt del usuario
export function enhancePrompt(userPrompt: string): string {
  // Añadir mejoras automáticas al prompt
  const enhancements = [
    'high quality',
    'detailed',
    'professional'
  ]
  
  const lowerPrompt = userPrompt.toLowerCase()
  
  // Evitar duplicar mejoras
  const needsEnhancement = !enhancements.some(e => lowerPrompt.includes(e))
  
  if (needsEnhancement && userPrompt.length < 200) {
    return `${userPrompt}, high quality, detailed`
  }
  
  return userPrompt
}
