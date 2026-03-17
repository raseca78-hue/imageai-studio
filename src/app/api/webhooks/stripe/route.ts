import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { PLAN_CONFIG } from '@/lib/auth'

// Webhook de Stripe para procesar eventos de pago
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    // Verificar que el webhook viene de Stripe
    let event
    try {
      event = verifyWebhookSignature(payload, signature)
    } catch (err: any) {
      console.error('Error verificando webhook:', err.message)
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
    }

    // Manejar diferentes eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan as 'PRO' | 'BUSINESS'
        const customerId = session.customer
        const subscriptionId = session.subscription

        if (userId && plan) {
          // Actualizar usuario al nuevo plan
          await db.user.update({
            where: { id: userId },
            data: {
              plan,
              credits: PLAN_CONFIG[plan].credits,
              creditsUsed: 0,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          })

          // Registrar actividad
          await db.activity.create({
            data: {
              userId,
              type: 'upgrade',
              description: `Actualizó al plan ${PLAN_CONFIG[plan].name} vía Stripe`,
              credits: 0
            }
          })

          console.log(`✅ Usuario ${userId} actualizado a plan ${plan}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customerId = subscription.customer
        
        // Buscar usuario por customer ID
        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId }
        })

        if (user && subscription.status === 'active') {
          // Actualizar período de suscripción
          await db.user.update({
            where: { id: user.id },
            data: {
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
            }
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId = subscription.customer
        
        // Usuario canceló suscripción - volver a plan gratuito
        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId }
        })

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              plan: 'FREE',
              credits: PLAN_CONFIG.FREE.credits,
              stripeSubscriptionId: null
            }
          })

          await db.activity.create({
            data: {
              userId: user.id,
              type: 'downgrade',
              description: 'Suscripción cancelada, vuelto a plan Gratuito',
              credits: 0
            }
          })

          console.log(`📉 Usuario ${user.id} vuelto a plan FREE`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const customerId = invoice.customer
        
        // Pago exitoso - renovar créditos
        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId }
        })

        if (user && user.plan !== 'FREE') {
          await db.user.update({
            where: { id: user.id },
            data: {
              credits: PLAN_CONFIG[user.plan].credits,
              creditsUsed: 0
            }
          })

          console.log(`💳 Créditos renovados para usuario ${user.id}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const customerId = invoice.customer
        
        console.log(`❌ Pago fallido para customer ${customerId}`)
        // Aquí podrías enviar un email al usuario
        break
      }

      default:
        console.log(`Evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error en webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}
