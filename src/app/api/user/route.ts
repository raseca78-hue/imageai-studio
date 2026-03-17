import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getToken } from 'next-auth/jwt'
import { PLAN_CONFIG } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    const userId = token?.id as string

    if (!userId) {
      return NextResponse.json({ 
        user: null,
        planConfig: PLAN_CONFIG.FREE
      })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        user: null,
        planConfig: PLAN_CONFIG.FREE
      })
    }

    // Verificar reset de créditos diarios
    const now = new Date()
    const lastReset = new Date(user.lastReset)
    
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
      user.credits = planCredits
      user.creditsUsed = 0
    }

    const planConfig = PLAN_CONFIG[user.plan]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
        credits: user.credits,
        creditsUsed: user.creditsUsed,
        createdAt: user.createdAt,
        imagesCount: user.images.length,
        activities: user.activities
      },
      planConfig
    })

  } catch (error: any) {
    console.error('Error en user API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
