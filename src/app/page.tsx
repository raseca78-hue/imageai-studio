'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Sparkles, 
  Zap, 
  Crown, 
  Check, 
  Download, 
  Image as ImageIcon, 
  Loader2, 
  Star,
  Wand2,
  Palette,
  Layers,
  Clock,
  TrendingUp,
  Users,
  Shield,
  ChevronRight,
  Play,
  Heart,
  Share2,
  Copy,
  RefreshCw,
  Menu,
  X,
  LogIn,
  User,
  Settings,
  CreditCard
} from 'lucide-react'

// Types
interface UserData {
  id: string
  email: string
  name: string
  plan: 'FREE' | 'PRO' | 'BUSINESS'
  credits: number
  creditsUsed: number
  imagesCount: number
  activities: Array<{
    id: string
    type: string
    description: string
    credits: number
    createdAt: string
  }>
}

interface PlanConfig {
  name: string
  price: number
  credits: number
  features: string[]
}

// Image sizes and styles
const IMAGE_SIZES = [
  { value: '1024x1024', label: 'Cuadrado 1:1', description: 'Instagram, Facebook' },
  { value: '768x1344', label: 'Retrato 9:16', description: 'Stories, Reels' },
  { value: '1344x768', label: 'Paisaje 16:9', description: 'YouTube, Blogs' },
  { value: '864x1152', label: 'Poster 3:4', description: 'Pósters, Flyers' },
  { value: '1152x864', label: 'Ancho 4:3', description: 'Banners web' },
]

const IMAGE_STYLES = [
  { value: 'none', label: 'Sin estilo', emoji: '🎨' },
  { value: 'realistic', label: 'Fotorrealista', emoji: '📷' },
  { value: 'digital-art', label: 'Arte Digital', emoji: '🖼️' },
  { value: 'anime', label: 'Anime', emoji: '🌸' },
  { value: 'oil-painting', label: 'Óleo', emoji: '🎨' },
  { value: '3d-render', label: '3D Render', emoji: '🎮' },
  { value: 'minimalist', label: 'Minimalista', emoji: '⬜' },
  { value: 'cyberpunk', label: 'Cyberpunk', emoji: '🤖' },
]

const PLANS: Record<string, PlanConfig> = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    credits: 5,
    features: ['5 imágenes por día', 'Calidad estándar', 'Descarga PNG', 'Historial 7 días']
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    credits: 100,
    features: ['100 imágenes por día', 'Alta calidad', 'Todos los estilos', 'Sin marca de agua', 'Historial ilimitado', 'Soporte prioritario']
  },
  BUSINESS: {
    name: 'Business',
    price: 29.99,
    credits: 999999,
    features: ['Imágenes ilimitadas', 'Máxima calidad', 'API access', 'Uso comercial', 'Soporte 24/7', 'Entrenamiento personalizado']
  }
}

// Example prompts for inspiration
const EXAMPLE_PROMPTS = [
  'Un gato astronauta flotando en el espacio con la Tierra de fondo',
  'Ciudad futurista al atardecer con coches voladores',
  'Paisaje montañoso con un lago cristalino y auroras boreales',
  'Dragón majestuoso descansando sobre una montaña de oro',
  'Jardín japonés con cerezos en flor y un puente rojo',
  'Robot amigable jugando con niños en un parque',
]

export default function HomePage() {
  // State
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [selectedSize, setSelectedSize] = useState('1024x1024')
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [activeTab, setActiveTab] = useState('generate')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [recentImages, setRecentImages] = useState<Array<{prompt: string; imageBase64: string; createdAt: Date}>>([])

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Generate image
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor escribe una descripción')
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null) // Limpiar imagen anterior
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size: selectedSize,
          style: selectedStyle
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsUpgrade) {
          toast.error('Sin créditos', {
            description: 'Actualiza tu plan para generar más imágenes',
            action: {
              label: 'Ver planes',
              onClick: () => setActiveTab('pricing')
            }
          })
        } else {
          toast.error(data.error || 'Error al generar imagen')
        }
        return
      }

      // Guardar URL de imagen (puede ser URL o base64)
      const imageData = data.imageUrl || data.imageBase64
      setGeneratedImage(imageData)
      
      // Añadir a recientes
      setRecentImages(prev => [{
        prompt: data.prompt || prompt,
        imageBase64: imageData,
        createdAt: new Date()
      }, ...prev.slice(0, 9)])
      
      // Update user credits
      if (user) {
        setUser({ ...user, credits: data.remainingCredits, creditsUsed: user.creditsUsed + 1 })
      }

      toast.success('¡Imagen generada!', {
        description: `Créditos restantes: ${data.remainingCredits}`
      })

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Download image
  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      let dataUrl: string
      
      if (generatedImage.startsWith('http')) {
        // Si es URL, descargar primero
        toast.info('Descargando imagen...')
        const response = await fetch(generatedImage)
        const blob = await response.blob()
        dataUrl = URL.createObjectURL(blob)
      } else {
        // Si es base64
        dataUrl = `data:image/png;base64,${generatedImage}`
      }
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `imageai-${Date.now()}.png`
      link.click()
      toast.success('Imagen descargada')
    } catch (error) {
      toast.error('Error al descargar')
    }
  }

  // Copy prompt
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Prompt copiado')
  }

  // Handle login
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      toast.error('Introduce un email válido')
      return
    }

    setIsLoggingIn(true)
    try {
      const response = await fetch('/api/auth/[...nextauth]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      })
      
      // For demo, just set a basic user
      setUser({
        id: 'demo-user',
        email: loginEmail,
        name: loginEmail.split('@')[0],
        plan: 'FREE',
        credits: 5,
        creditsUsed: 0,
        imagesCount: 0,
        activities: []
      })
      
      setShowLoginDialog(false)
      toast.success(`¡Bienvenido, ${loginEmail.split('@')[0]}!`)
      fetchUserData()
      
    } catch (error) {
      toast.error('Error al iniciar sesión')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Estado para pago procesándose
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Verificar pago exitoso al cargar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    
    if (paymentStatus === 'success') {
      toast.success('¡Pago completado!', {
        description: 'Tu plan ha sido actualizado. ¡Disfruta tus créditos!'
      })
      // Limpiar URL
      window.history.replaceState({}, '', '/')
      // Recargar datos del usuario
      fetchUserData()
    } else if (paymentStatus === 'cancelled') {
      toast.error('Pago cancelado', {
        description: 'Puedes intentarlo de nuevo cuando quieras'
      })
      window.history.replaceState({}, '', '/')
    }
  }, [fetchUserData])

  // Upgrade plan con Stripe
  const handleUpgrade = async (plan: 'PRO' | 'BUSINESS') => {
    if (!user) {
      setShowLoginDialog(true)
      toast.error('Inicia sesión primero', {
        description: 'Necesitas una cuenta para suscribirte'
      })
      return
    }

    setIsProcessingPayment(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      const data = await response.json()

      if (data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Error al procesar el pago')
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'Por favor intenta de nuevo'
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Credit percentage
  const creditPercentage = user ? (user.credits / PLANS[user.plan].credits) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">ImageAI Studio</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => setActiveTab('generate')}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generar
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab('pricing')}>
              <Crown className="w-4 h-4 mr-2" />
              Planes
            </Button>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Badge variant={user.plan === 'FREE' ? 'secondary' : 'default'} className="hidden sm:flex">
                  {user.plan === 'FREE' ? 'Gratuito' : user.plan}
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">{user.credits}</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mi Cuenta</DialogTitle>
                      <DialogDescription>
                        Gestiona tu cuenta y plan
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Plan actual</span>
                          <Badge>{PLANS[user.plan].name}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Créditos restantes</span>
                          <span className="font-medium">{user.credits} / {PLANS[user.plan].credits === 999999 ? '∞' : PLANS[user.plan].credits}</span>
                        </div>
                        <Progress value={creditPercentage} className="h-2" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <Button onClick={() => setShowLoginDialog(true)}>
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('generate'); setIsMenuOpen(false) }}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generar
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('pricing'); setIsMenuOpen(false) }}>
              <Crown className="w-4 h-4 mr-2" />
              Planes
            </Button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsContent value="generate" className="space-y-8 mt-0">
            {/* Hero section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Potenciado por Inteligencia Artificial
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Crea imágenes increíbles con <span className="gradient-text">IA</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transforma tus ideas en imágenes espectaculares en segundos. Perfecto para creadores de contenido, marketers y diseñadores.
              </p>
            </div>

            {/* Generator */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Input section */}
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    Describe tu imagen
                  </CardTitle>
                  <CardDescription>
                    Escribe lo que quieres ver y la IA hará el resto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prompt input */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ej: Un gato astronauta flotando en el espacio con la Tierra de fondo, estilo digital art..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none"
                      disabled={isGenerating}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sé específico para mejores resultados</span>
                      <span>{prompt.length}/500</span>
                    </div>
                  </div>

                  {/* Quick prompts */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Ideas rápidas:</Label>
                    <div className="flex flex-wrap gap-2">
                      {EXAMPLE_PROMPTS.slice(0, 3).map((example, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5 px-2.5"
                          onClick={() => setPrompt(example)}
                        >
                          {example.substring(0, 30)}...
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Size selector */}
                  <div className="space-y-2">
                    <Label>Tamaño</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            <div className="flex items-center gap-2">
                              <span>{size.label}</span>
                              <span className="text-xs text-muted-foreground">({size.description})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Style selector */}
                  <div className="space-y-2">
                    <Label>Estilo</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {IMAGE_STYLES.map((style) => (
                        <Button
                          key={style.value}
                          variant={selectedStyle === style.value ? 'default' : 'outline'}
                          size="sm"
                          className="flex-col h-auto py-2"
                          onClick={() => setSelectedStyle(style.value)}
                        >
                          <span className="text-lg">{style.emoji}</span>
                          <span className="text-xs mt-1">{style.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Generate button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                  >
                    {isGenerating ? (
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

                  {/* Credits info */}
                  {user && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm">Créditos restantes</span>
                      </div>
                      <span className="font-semibold">{user.credits}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Output section */}
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Resultado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-muted to-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden">
                    {isGenerating ? (
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                        <p className="text-muted-foreground">Creando tu imagen...</p>
                        <Progress value={undefined} className="w-48 h-2 mx-auto animate-pulse" />
                      </div>
                    ) : generatedImage ? (
                      <img
                        src={generatedImage.startsWith('http') ? generatedImage : `data:image/png;base64,${generatedImage}`}
                        alt="Generated"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = '/placeholder.png'
                        }}
                      />
                    ) : (
                      <div className="text-center space-y-4 p-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-primary/60" />
                        </div>
                        <div>
                          <p className="font-medium">Tu imagen aparecerá aquí</p>
                          <p className="text-sm text-muted-foreground">Escribe un prompt y haz clic en generar</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {generatedImage && (
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleDownload} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                      <Button variant="outline" onClick={() => handleCopyPrompt(prompt)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Prompt
                      </Button>
                      <Button variant="outline" onClick={() => setGeneratedImage(null)}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent images */}
            {recentImages.length > 0 && (
              <div className="max-w-6xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold">Generaciones recientes</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {recentImages.map((img, i) => (
                    <Card key={i} className="overflow-hidden group cursor-pointer">
                      <div className="aspect-square relative">
                        <img
                          src={`data:image/png;base64,${img.imageBase64}`}
                          alt={img.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <Zap className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Ultra Rápido</CardTitle>
                  <CardDescription>
                    Genera imágenes en segundos con nuestra IA de última generación
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-primary/20">
                <CardHeader>
                  <Palette className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Múltiples Estilos</CardTitle>
                  <CardDescription>
                    Desde fotorrealismo hasta anime, pasando por arte digital y óleo
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-primary/20">
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Uso Comercial</CardTitle>
                  <CardDescription>
                    Las imágenes son tuyas, úsalas donde quieras sin restricciones
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Stats */}
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="py-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                      <p className="text-3xl md:text-4xl font-bold gradient-text">1M+</p>
                      <p className="text-sm text-muted-foreground">Imágenes generadas</p>
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-bold gradient-text">50K+</p>
                      <p className="text-sm text-muted-foreground">Usuarios activos</p>
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-bold gradient-text">10+</p>
                      <p className="text-sm text-muted-foreground">Estilos disponibles</p>
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-bold gradient-text">4.9★</p>
                      <p className="text-sm text-muted-foreground">Valoración media</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-8 mt-0">
            {/* Pricing header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge variant="secondary" className="px-4 py-1.5">
                <Crown className="w-4 h-4 mr-2" />
                Planes y Precios
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Elige el plan perfecto para ti
              </h1>
              <p className="text-lg text-muted-foreground">
                Comienza gratis y escala según tus necesidades. Sin compromisos.
              </p>
            </div>

            {/* Pricing cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free plan */}
              <Card className={`relative ${user?.plan === 'FREE' ? 'border-primary' : ''}`}>
                {user?.plan === 'FREE' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Plan actual</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">Gratuito</CardTitle>
                  <CardDescription>Perfecto para empezar</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {PLANS.FREE.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    Plan actual
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro plan */}
              <Card className={`relative border-primary shadow-lg ${user?.plan === 'PRO' ? 'ring-2 ring-primary' : ''}`}>
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Más popular</Badge>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <CardDescription>Para creadores serios</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {PLANS.PRO.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleUpgrade('PRO')}
                    disabled={user?.plan === 'PRO' || user?.plan === 'BUSINESS' || isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
                    ) : user?.plan === 'PRO' ? 'Plan actual' : user?.plan === 'BUSINESS' ? 'Incluido' : (
                      <><CreditCard className="w-4 h-4 mr-2" />Suscribirse $9.99/mes</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Business plan */}
              <Card className={`relative ${user?.plan === 'BUSINESS' ? 'border-primary' : ''}`}>
                {user?.plan === 'BUSINESS' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Plan actual</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">Business</CardTitle>
                  <CardDescription>Para equipos y empresas</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29.99</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {PLANS.BUSINESS.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleUpgrade('BUSINESS')}
                    disabled={user?.plan === 'BUSINESS' || isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
                    ) : user?.plan === 'BUSINESS' ? 'Plan actual' : (
                      <><CreditCard className="w-4 h-4 mr-2" />Suscribirse $29.99/mes</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold text-center">Preguntas frecuentes</h2>
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">¿Puedo cancelar en cualquier momento?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Sí, puedes cancelar tu suscripción en cualquier momento. Seguirás teniendo acceso hasta el final del período de pago.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">¿Las imágenes son de mi propiedad?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Absolutamente. Todas las imágenes que generes son tuyas y puedes usarlas para cualquier propósito, incluyendo uso comercial.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">¿Qué pasa si se me acaban los créditos?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Los créditos se renuevan diariamente. Si necesitas más, puedes actualizar tu plan en cualquier momento.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">ImageAI Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ImageAI Studio. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Términos</span>
              <span>Privacidad</span>
              <span>Contacto</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accede a tu cuenta</DialogTitle>
            <DialogDescription>
              Introduce tu email para empezar a crear
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Entrar
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Al entrar, aceptas nuestros términos y condiciones
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
