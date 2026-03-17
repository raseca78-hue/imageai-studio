import { db } from './db'
import { hash, compare } from 'crypto'

// Configuración de planes
export const PLAN_CONFIG = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    credits: 5,
    features: [
      '5 imágenes por día',
      'Calidad estándar',
      'Descarga en PNG',
      'Historial de 7 días'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    credits: 100,
    features: [
      '100 imágenes por día',
      'Alta calidad',
      'Descarga en PNG/JPG',
      'Historial ilimitado',
      'Estilos premium',
      'Sin marca de agua'
    ]
  },
  BUSINESS: {
    name: 'Business',
    price: 29.99,
    credits: 999999, // Prácticamente ilimitado
    features: [
      'Imágenes ilimitadas',
      'Máxima calidad',
      'API access',
      'Historial ilimitado',
      'Todos los estilos',
      'Soporte prioritario',
      'Uso comercial'
    ]
  }
}

// Hash password simple para demo
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'imageai_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Crear o actualizar usuario
export async function createOrUpdateUser(email: string, name?: string, password?: string) {
  const existingUser = await db.user.findUnique({ where: { email } })
  
  if (existingUser) {
    return existingUser
  }
  
  const hashedPassword = password ? await hashPassword(password) : null
  
  return db.user.create({
    data: {
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
      plan: 'FREE',
      credits: PLAN_CONFIG.FREE.credits,
      creditsUsed: 0
    }
  })
}

// Verificar y resetear créditos diarios
export async function getUserWithCredits(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return null
  
  const now = new Date()
  const lastReset = new Date(user.lastReset)
  
  // Resetear créditos si pasó un día
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    
    const planCredits = PLAN_CONFIG[user.plan].credits
    await db.user.update({
      where: { id: userId },
      data: {
        credits: planCredits,
        creditsUsed: 0,
        lastReset: now
      }
    })
    
    return { ...user, credits: planCredits, creditsUsed: 0 }
  }
  
  return user
}

// Descontar créditos
export async function deductCredits(userId: string, amount: number = 1): Promise<{ success: boolean; remaining: number; error?: string }> {
  const user = await getUserWithCredits(userId)
  if (!user) {
    return { success: false, remaining: 0, error: 'Usuario no encontrado' }
  }
  
  if (user.credits < amount) {
    return { success: false, remaining: user.credits, error: 'Créditos insuficientes' }
  }
  
  await db.user.update({
    where: { id: userId },
    data: {
      credits: { decrement: amount },
      creditsUsed: { increment: amount }
    }
  })
  
  return { success: true, remaining: user.credits - amount }
}

// Obtener límite diario según plan
export function getDailyLimit(plan: string): number {
  return PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]?.credits || 5
}
