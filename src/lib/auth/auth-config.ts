import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../database'
import { AuthService } from './auth'

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const result = await AuthService.login({
            username: credentials.username,
            password: credentials.password
          })

          if (result.success && result.user) {
            return {
              id: result.user.id,
              email: result.user.email,
              name: result.user.displayName,
              image: result.user.profileImage,
              username: result.user.username,
              displayName: result.user.displayName,
              language: result.user.language,
              theme: result.user.theme,
              backgroundImage: result.user.backgroundImage,
              backgroundBlur: result.user.backgroundBlur,
              backgroundBrightness: result.user.backgroundBrightness,
              backgroundOpacity: result.user.backgroundOpacity
            }
          }
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Always set default theme to dark if not present
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.displayName = (user as any).displayName
        token.language = (user as any).language || 'en'
        token.theme = (user as any).theme || 'dark'
        token.backgroundImage = (user as any).backgroundImage
        token.backgroundBlur = (user as any).backgroundBlur || 0
        token.backgroundBrightness = (user as any).backgroundBrightness || 70
        token.backgroundOpacity = (user as any).backgroundOpacity || 0.1
      } else {
        // Not logged in, force theme to dark
        token.theme = 'dark'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).username = token.username
        ;(session.user as any).displayName = token.displayName
        ;(session.user as any).language = token.language
        ;(session.user as any).theme = token.theme
        ;(session.user as any).backgroundImage = token.backgroundImage
        ;(session.user as any).backgroundBlur = token.backgroundBlur
        ;(session.user as any).backgroundBrightness = token.backgroundBrightness
        ;(session.user as any).backgroundOpacity = token.backgroundOpacity
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}
