import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createUser, getUserByEmail, saveUserToken } from '@/lib/supabase'

const GMAIL_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://mail.google.com/'
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: GMAIL_SCOPES.join(' ')
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false

      try {
        // Criar ou atualizar usuário no Supabase
        const dbUser = await createUser({
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined
        })

        // Salvar tokens no Supabase
        if (account.access_token && account.refresh_token) {
          await saveUserToken({
            user_id: dbUser.id,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600000
          })
        }

        return true
      } catch (error) {
        console.error('Erro no signIn:', error)
        return false
      }
    },

    async session({ session, token }) {
      if (session.user && token.email) {
        try {
          const dbUser = await getUserByEmail(token.email as string)
          if (dbUser) {
            session.user.id = dbUser.id
          }
        } catch (error) {
          console.error('Erro ao buscar usuário na session:', error)
        }
      }
      return session
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    }
  },

  pages: {
    signIn: '/',
    error: '/'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  },

  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
