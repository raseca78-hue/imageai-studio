// Generador de imágenes GRATUITO usando Hugging Face API
// Funciona en Vercel - 100% gratis sin API key para modelos públicos

// Tamaños disponibles
export const IMAGE_SIZES = [
  { value: '512x512', label: 'Cuadrado (512x512)', description: 'Rápido' },
  { value: '768x768', label: 'Grande (768x768)', description: 'Más detalle' },
]

// Estilos predefinidos
export const IMAGE_STYLES = [
  { value: 'none', label: 'Sin estilo', prompt: '' },
  { value: 'realistic', label: 'Fotorrealista', prompt: 'photorealistic, highly detailed, 8k photo' },
  { value: 'digital-art', label: 'Arte Digital', prompt: 'digital art, trending on artstation' },
  { value: 'anime', label: 'Anime', prompt: 'anime style, high quality' },
  { value: 'oil-painting', label: 'Óleo', prompt: 'oil painting, masterpiece' },
  { value: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk, neon lights, futuristic' },
]

// Modelo gratuito de Stable Diffusion en Hugging Face
const MODEL_API = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

export async function generateImage(
  prompt: string,
  size: string = '512x512',
  style: string = 'none'
): Promise<{ 
  success: boolean
  imageBase64?: string
  error?: string 
}> {
  try {
    const [width, height] = size.split('x').map(Number)
    
    // Obtener estilo
    const styleData = IMAGE_STYLES.find(s => s.value === style)
    const finalPrompt = styleData?.prompt 
      ? `${prompt}, ${styleData.prompt}`
      : prompt

    console.log('🎨 Generando con Hugging Face (GRATIS):', finalPrompt.substring(0, 60))

    // Llamar a Hugging Face API - GRATIS para modelos públicos
    const response = await fetch(MODEL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: finalPrompt,
        parameters: {
          width,
          height,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HF Error:', response.status, errorText)
      
      // Si está cargando el modelo, esperar y reintentar
      if (response.status === 503) {
        return { 
          success: false, 
          error: 'El modelo se está cargando. Espera 20 segundos e intenta de nuevo.' 
        }
      }
      
      return { 
        success: false, 
        error: `Error del servidor (${response.status}). Intenta de nuevo.` 
      }
    }

    // La respuesta es la imagen directamente en bytes
    const imageBuffer = await response.arrayBuffer()
    
    if (!imageBuffer || imageBuffer.byteLength < 1000) {
      return { success: false, error: 'No se pudo generar la imagen' }
    }

    // Convertir a base64
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')
    
    console.log('✅ Imagen generada!')
    
    return { 
      success: true, 
      imageBase64 
    }

  } catch (error: any) {
    console.error('Error:', error)
    return {
      success: false,
      error: 'Error de conexión. Intenta de nuevo.'
    }
  }
}

export function enhancePrompt(userPrompt: string): string {
  return userPrompt.trim()
}
