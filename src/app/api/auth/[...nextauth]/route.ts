import { db } from '@/lib/db'
import { PLAN_CONFIG } from '@/lib/auth'

// Configuración de NextAuth para ImageAI Studio
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'tu@email.com' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // Buscar o crear usuario (para demo, creamos automáticamente)
        let user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          // Crear usuario nuevo automáticamente para demo
          const { hashPassword } = await import('@/lib/auth')
          const hashedPassword = credentials.password ? await hashPassword(credentials.password) : null
          
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              password: hashedPassword,
              plan: 'FREE',
              credits: PLAN_CONFIG.FREE.credits,
              creditsUsed: 0
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        
        // Obtener datos actualizados del usuario
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string }
        })
        
        if (dbUser) {
          session.user.plan = dbUser.plan
          session.user.credits = dbUser.credits
          session.user.creditsUsed = dbUser.creditsUsed
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    signOut: '/'
  },
  session: {
    strategy: 'jwt'
  },
  secret: 'imageai-studio-secret-key-2024-demo'
})

export { handler as GET, handler as POST }
