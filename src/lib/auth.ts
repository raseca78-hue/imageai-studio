import { db } from './db'

// Configuración de planes
export const PLAN_CONFIG = {
  FREE: {
    name: 'Prueba',
    price: 0,
    credits: 1,
    features: [
      '1 imagen de prueba',
      'Para verificar que funciona',
      'Sin compromiso'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    credits: 100,
    features: [
      '100 imágenes por día',
      'Alta calidad',
      'Todos los estilos',
      'Sin marca de agua'
    ]
  },
  BUSINESS: {
    name: 'Business',
    price: 29.99,
    credits: 999999,
    features: [
      'Imágenes ilimitadas',
      'Máxima calidad',
      'API access',
      'Uso comercial'
    ]
  }
}

// Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'imageai_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Obtener usuario con créditos actualizados
export async function getUserWithCredits(userId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return null

    const now = new Date()
    const lastReset = new Date(user.lastReset)

    // Solo resetear créditos para planes de pago
    // El plan FREE tiene 1 crédito que NO se resetea
    if (user.plan !== 'FREE') {
      if (now.getDate() !== lastReset.getDate() || 
          now.getMonth() !== lastReset.getMonth() || 
          now.getFullYear() !== lastReset.getFullYear()) {
        
        const planCredits = PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG]?.credits || 100
        
        const updated = await db.user.update({
          where: { id: userId },
          data: {
            credits: planCredits,
            creditsUsed: 0,
            lastReset: now
          }
        })
        return updated
      }
    }

    return user
  } catch (error) {
    console.error('Error en getUserWithCredits:', error)
    return null
  }
}

// Descontar créditos
export async function deductCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: amount },
        creditsUsed: { increment: amount }
      }
    })
    return true
  } catch (error) {
    console.error('Error en deductCredits:', error)
    return false
  }
}

// Obtener límite según plan
export function getDailyLimit(plan: string): number {
  return PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]?.credits || 1
}
