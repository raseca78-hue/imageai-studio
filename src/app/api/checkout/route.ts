import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getToken } from 'next-auth/jwt'
import { PLAN_CONFIG } from '@/lib/auth'

// API para procesar pagos (simulada para demo)
// En producción, esto se conectaría con Stripe

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    const userId = token?.id as string

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!['PRO', 'BUSINESS'].includes(plan)) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }

    // Simulación de pago exitoso
    // En producción, aquí iría la integración con Stripe
    
    const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
    
    // Actualizar usuario al nuevo plan
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        plan,
        credits: planConfig.credits,
        creditsUsed: 0,
        stripeCustomerId: `cus_demo_${Date.now()}`,
        stripeSubscriptionId: `sub_demo_${Date.now()}`,
        stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 días
      }
    })

    // Registrar actividad
    await db.activity.create({
      data: {
        userId,
        type: 'upgrade',
        description: `Actualizó al plan ${planConfig.name}`,
        credits: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: `¡Felicidades! Ahora tienes el plan ${planConfig.name}`,
      user: {
        plan: updatedUser.plan,
        credits: updatedUser.credits
      }
    })

  } catch (error: any) {
    console.error('Error en checkout:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
