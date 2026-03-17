// Configuración de planes
export const PLAN_CONFIG = {
  FREE: {
    name: 'Prueba',
    price: 0,
    credits: 1,
    features: ['1 imagen de prueba', 'Sin compromiso']
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    credits: 100,
    features: ['100 imágenes/día', 'Alta calidad', 'Todos los estilos']
  },
  BUSINESS: {
    name: 'Business',
    price: 29.99,
    credits: 999999,
    features: ['Ilimitado', 'API access', 'Uso comercial']
  }
}

// Obtener usuario con créditos
export async function getUserWithCredits(userId: string) {
  try {
    const { db } = await import('./db')
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return null

    // Solo resetear para planes de pago
    if (user.plan !== 'FREE') {
      const now = new Date()
      const lastReset = new Date(user.lastReset)
      
      if (now.getDate() !== lastReset.getDate() || 
          now.getMonth() !== lastReset.getMonth() || 
          now.getFullYear() !== lastReset.getFullYear()) {
        
        const credits = PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG]?.credits || 100
        
        return await db.user.update({
          where: { id: userId },
          data: { credits, creditsUsed: 0, lastReset: now }
        })
      }
    }

    return user
  } catch {
    return null
  }
}

// Descontar créditos
export async function deductCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    const { db } = await import('./db')
    await db.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: amount },
        creditsUsed: { increment: amount }
      }
    })
    return true
  } catch {
    return false
  }
}
