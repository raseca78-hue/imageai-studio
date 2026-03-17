'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Sparkles, Download, Loader2 } from 'lucide-react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error('Escribe una descripción')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })
      
      const data = await res.json()
      
      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
        toast.success('¡Imagen generada!')
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `imagen-${Date.now()}.png`
    a.click()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold">ImageAI Studio</h1>
          </div>
          <p className="text-xl text-gray-300">Genera imágenes con IA - 100% GRATIS</p>
        </div>

        {/* Main Card */}
        <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Describe tu imagen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ej: un gato astronauta flotando en el espacio..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              disabled={loading}
            />
            
            <Button 
              onClick={generate} 
              disabled={loading || !prompt.trim()}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generar Imagen
                </>
              )}
            </Button>

            {/* Result */}
            {imageUrl && (
              <div className="mt-4 space-y-4">
                <img 
                  src={imageUrl} 
                  alt="Imagen generada" 
                  className="w-full rounded-lg"
                />
                <Button onClick={download} variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="max-w-2xl mx-auto mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-2xl mb-1">🎨</div>
            <div className="text-sm text-gray-300">Fotorrealista</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-sm text-gray-300">Arte Digital</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-2xl mb-1">🌸</div>
            <div className="text-sm text-gray-300">Anime</div>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-sm">
          Powered by AI • 100% Gratuito • Sin registro
        </p>
      </div>
    </main>
  )
}
