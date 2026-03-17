import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    const userId = token?.id as string
    const userEmail = token?.email as string

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para comprar' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan } = body

    if (!['PRO', 'BUSINESS'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      )
    }

    // Crear sesión de Stripe Checkout
    const session = await createCheckoutSession(userId, userEmail, plan)

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    })

  } catch (error: any) {
    console.error('Error creando sesión de checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
