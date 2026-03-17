import Stripe from 'stripe'

// Inicializar Stripe con la clave secreta
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
})

// Configuración de precios de Stripe
// Crea estos productos en tu dashboard de Stripe y copia los Price IDs
export const STRIPE_PRICES = {
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    amount: 999, // $9.99 en centavos
    name: 'Plan Pro',
    description: '100 imágenes por día, alta calidad, todos los estilos'
  },
  BUSINESS: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business_placeholder',
    amount: 2999, // $29.99 en centavos
    name: 'Plan Business',
    description: 'Imágenes ilimitadas, API access, soporte prioritario'
  }
}

// Crear sesión de checkout
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  plan: 'PRO' | 'BUSINESS'
) {
  const priceConfig = STRIPE_PRICES[plan]
  
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceConfig.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=cancelled`,
    metadata: {
      userId,
      plan,
    },
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
    },
  })

  return session
}

// Verificar webhook signature
export function verifyWebhookSignature(payload: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET no está configurado')
  }
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
