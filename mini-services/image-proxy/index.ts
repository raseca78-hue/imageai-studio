// Mini-servicio proxy para generación de imágenes
// Corre en puerto 3030 y recibe peticiones del frontend

import ZAI from 'z-ai-web-dev-sdk'
import { createServer } from 'http'
import { URL } from 'url'

const PORT = 3030

// Tamaños permitidos
const ALLOWED_SIZES = ['1024x1024', '768x1344', '1344x768', '864x1152', '1152x864', '1440x720', '720x1440']

// Estilos
const STYLES: Record<string, string> = {
  'none': '',
  'realistic': 'photorealistic, highly detailed, professional photography, 8k',
  'digital-art': 'digital art, vibrant colors, modern illustration, trending on artstation',
  'anime': 'anime style, manga aesthetic, vibrant colors, detailed linework',
  'oil-painting': 'oil painting style, classical art, masterpiece, rich textures',
  '3d-render': '3D render, octane render, highly detailed, volumetric lighting',
  'minimalist': 'minimalist design, clean lines, simple shapes, modern aesthetic',
  'cyberpunk': 'cyberpunk style, neon lights, futuristic, dark atmosphere',
}

async function generateImage(prompt: string, size: string, style: string): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  try {
    const stylePrompt = STYLES[style] || ''
    const finalPrompt = stylePrompt ? `${prompt}, ${stylePrompt}` : prompt

    console.log('🎨 Generando:', finalPrompt.substring(0, 80))

    const zai = await ZAI.create()
    const response = await zai.images.generations.create({
      prompt: finalPrompt,
      size: size as any
    })

    const imageBase64 = response.data[0]?.base64

    if (!imageBase64) {
      return { success: false, error: 'No se generó imagen' }
    }

    console.log('✅ Imagen generada!')
    return { success: true, imageBase64 }
  } catch (error: any) {
    console.error('❌ Error:', error)
    return { success: false, error: error.message }
  }
}

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`)

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', service: 'image-proxy' }))
    return
  }

  // Generar imagen
  if (req.method === 'POST' && url.pathname === '/generate') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', async () => {
      try {
        const { prompt, size = '1024x1024', style = 'none' } = JSON.parse(body)

        if (!prompt || prompt.trim().length < 3) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Prompt muy corto' }))
          return
        }

        if (!ALLOWED_SIZES.includes(size)) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Tamaño no válido' }))
          return
        }

        const result = await generateImage(prompt.trim(), size, style)
        
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
      } catch (error: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    })
    return
  }

  // GET con query params (más fácil de probar)
  if (req.method === 'GET' && url.pathname === '/generate') {
    const prompt = url.searchParams.get('prompt')
    const size = url.searchParams.get('size') || '1024x1024'
    const style = url.searchParams.get('style') || 'none'

    if (!prompt) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Falta prompt' }))
      return
    }

    const result = await generateImage(prompt, size, style)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result))
    return
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log(`🖼️ Image Proxy Service running on port ${PORT}`)
  console.log(`📝 Test: http://localhost:${PORT}/generate?prompt=a%20cute%20cat`)
})
