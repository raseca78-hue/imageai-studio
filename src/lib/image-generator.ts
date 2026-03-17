// Generador de imágenes - usa el mini-servicio proxy interno

// Tamaños disponibles
export const IMAGE_SIZES = [
  { value: '1024x1024', label: 'Cuadrado 1:1', description: 'Instagram, Facebook' },
  { value: '768x1344', label: 'Retrato 9:16', description: 'Stories, Reels' },
  { value: '1344x768', label: 'Paisaje 16:9', description: 'YouTube, Blogs' },
]

// Estilos predefinidos
export const IMAGE_STYLES = [
  { value: 'none', label: 'Sin estilo', emoji: '🎨' },
  { value: 'realistic', label: 'Fotorrealista', emoji: '📷' },
  { value: 'digital-art', label: 'Arte Digital', emoji: '🖼️' },
  { value: 'anime', label: 'Anime', emoji: '🌸' },
  { value: 'oil-painting', label: 'Óleo', emoji: '🎨' },
  { value: '3d-render', label: '3D Render', emoji: '🎮' },
  { value: 'minimalist', label: 'Minimalista', emoji: '⬜' },
  { value: 'cyberpunk', label: 'Cyberpunk', emoji: '🤖' },
]

// URL del proxy de imágenes (puerto 3030)
const IMAGE_PROXY_URL = process.env.IMAGE_PROXY_URL || 'http://localhost:3030'

// Generar imagen
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
    console.log('🎨 Enviando petición al proxy de imágenes...')
    
    // Llamar al mini-servicio proxy
    const response = await fetch(`${IMAGE_PROXY_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, size, style })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return { 
        success: false, 
        error: data.error || 'Error al generar la imagen' 
      }
    }

    console.log('✅ Imagen recibida del proxy')

    return { 
      success: true, 
      imageBase64: data.imageBase64,
      imageUrl: data.imageUrl
    }

  } catch (error: any) {
    console.error('❌ Error:', error)
    
    // Fallback: intentar con URL directa
    return {
      success: false,
      error: 'El servicio de imágenes no está disponible. Intenta de nuevo en unos segundos.'
    }
  }
}

// Mejorar prompt
export function enhancePrompt(userPrompt: string): string {
  const prompt = userPrompt.trim()
  const lowerPrompt = prompt.toLowerCase()
  
  if (!lowerPrompt.includes('quality') && !lowerPrompt.includes('detailed')) {
    return `${prompt}, high quality, detailed`
  }

  return prompt
}
