// Generador de imágenes GRATUITO usando Pollinations.ai
// 100% gratis, sin API key, sin límites

// Tamaños disponibles
export const IMAGE_SIZES = [
  { value: '1024x1024', label: 'Cuadrado 1:1', description: 'Instagram, Facebook' },
  { value: '768x1344', label: 'Retrato 9:16', description: 'Stories, Reels' },
  { value: '1344x768', label: 'Paisaje 16:9', description: 'YouTube, Blogs' },
]

// Estilos predefinidos
export const IMAGE_STYLES = [
  { value: 'none', label: 'Sin estilo', emoji: '🎨', prompt: '' },
  { value: 'realistic', label: 'Fotorrealista', emoji: '📷', prompt: 'photorealistic, highly detailed, professional photography, 8k' },
  { value: 'digital-art', label: 'Arte Digital', emoji: '🖼️', prompt: 'digital art, vibrant colors, modern illustration, trending on artstation' },
  { value: 'anime', label: 'Anime', emoji: '🌸', prompt: 'anime style, manga aesthetic, vibrant colors, detailed' },
  { value: 'oil-painting', label: 'Óleo', emoji: '🎨', prompt: 'oil painting style, classical art, masterpiece, rich textures' },
  { value: '3d-render', label: '3D Render', emoji: '🎮', prompt: '3D render, octane render, highly detailed, volumetric lighting' },
  { value: 'minimalist', label: 'Minimalista', emoji: '⬜', prompt: 'minimalist design, clean lines, simple shapes, modern' },
  { value: 'cyberpunk', label: 'Cyberpunk', emoji: '🤖', prompt: 'cyberpunk style, neon lights, futuristic, dark atmosphere' },
]

// Generar imagen - devuelve URL directamente
export async function generateImage(
  prompt: string,
  size: string = '1024x1024',
  style: string = 'none'
): Promise<{ 
  success: boolean
  imageUrl?: string
  imageBase64?: string
  error?: string 
}> {
  try {
    // Obtener estilo
    const styleData = IMAGE_STYLES.find(s => s.value === style)
    const finalPrompt = styleData?.prompt
      ? `${prompt}, ${styleData.prompt}`
      : prompt

    // Dimensiones
    const [width, height] = size.split('x').map(Number)

    // URL única
    const seed = Math.floor(Math.random() * 100000000)
    const encodedPrompt = encodeURIComponent(finalPrompt)
    
    // Pollinations.ai - GRATIS para siempre
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&model=flux`

    console.log('🎨 Generando:', finalPrompt.substring(0, 50) + '...')
    console.log('📡 URL:', imageUrl)

    return { 
      success: true, 
      imageUrl,
      imageBase64: '' // El frontend cargará desde la URL
    }

  } catch (error: any) {
    console.error('❌ Error:', error)
    return {
      success: false,
      error: 'Error al generar. Intenta de nuevo.'
    }
  }
}

// Mejorar prompt automáticamente
export function enhancePrompt(userPrompt: string): string {
  const prompt = userPrompt.trim()
  const lowerPrompt = prompt.toLowerCase()
  
  // Añadir mejoras si no las tiene
  const enhancements: string[] = []
  
  if (!lowerPrompt.includes('quality') && !lowerPrompt.includes('detailed')) {
    enhancements.push('high quality', 'detailed')
  }
  
  if (!lowerPrompt.includes('professional') && prompt.length < 150) {
    enhancements.push('professional')
  }

  if (enhancements.length > 0 && prompt.length < 200) {
    return `${prompt}, ${enhancements.join(', ')}`
  }

  return prompt
}
