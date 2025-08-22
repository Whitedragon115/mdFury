import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../prisma'
import { AuthService } from './auth'

// Helper types to avoid explicit `any`
interface NextAuthUser {
  id?: string
  username?: string
  name?: string | null
  email?: string | null
  image?: string | null
  profileImage?: string | null
  displayName?: string | null
  language?: string | null
  theme?: 'light' | 'dark' | 'system' | null
  backgroundImage?: string | null
  backgroundBlur?: number | null
  backgroundBrightness?: number | null
  backgroundOpacity?: number | null
}

type Tokenish = Record<string, unknown>

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

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
    async signIn({ user, account }) {
      // For OAuth providers
      if (account?.provider === 'google' || account?.provider === 'github') {
        // Check if OAuth registration is disabled
        if (process.env.DISABLE_OAUTH_REGISTRATION === 'true') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser) {
            return false
          }
        }
        return true
      }
      
      // For credentials provider
      return true
    },
    
    async jwt({ token, user, account, trigger }) {
      
      // If this is a session update trigger, refresh data from database
      if (trigger === 'update' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string }
        })
        
        if (dbUser) {
          token.id = dbUser.id
          token.username = dbUser.username
          token.displayName = dbUser.displayName || dbUser.name
          token.profileImage = dbUser.profileImage || dbUser.image
          token.language = dbUser.language
          token.theme = dbUser.theme
          token.backgroundImage = dbUser.backgroundImage
          token.backgroundBlur = dbUser.backgroundBlur
          token.backgroundBrightness = dbUser.backgroundBrightness
          token.backgroundOpacity = dbUser.backgroundOpacity
        }
        return token
      }

      // If this is the first time JWT is created (when user signs in)
      if (user) {
        
        if (account?.provider === 'google' || account?.provider === 'github') {
          // For OAuth users, get fresh data from database and sync fields
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (dbUser) {
            // Sync NextAuth fields with our custom fields if they exist
            let needsUpdate = false
            const updateData: Partial<{ displayName: string; profileImage: string; name: string }> = {}
            
            // For OAuth users, always use the fresh name from the provider
            // Sync provider name to both name and displayName fields
            if (user.name && dbUser.name !== user.name) {
              updateData.name = user.name
              updateData.displayName = user.name
              needsUpdate = true
            } else if (user.name && (!dbUser.displayName || dbUser.displayName !== user.name)) {
              // Also sync name -> displayName if displayName is missing or different
              updateData.displayName = user.name
              needsUpdate = true
            }
            
            // Sync image -> profileImage
            if (user.image && (!dbUser.profileImage || dbUser.profileImage !== user.image)) {
              updateData.profileImage = user.image
              needsUpdate = true
            }
            
            // Update user if needed
            if (needsUpdate) {
              const updatedDbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: updateData
              })
              // Use updated data for token
              token.id = updatedDbUser.id
              token.username = updatedDbUser.username
              token.displayName = updatedDbUser.displayName || updatedDbUser.name
              token.profileImage = updatedDbUser.profileImage || updatedDbUser.image
            } else {
              token.id = dbUser.id
              token.username = dbUser.username
              token.displayName = dbUser.displayName || dbUser.name
              token.profileImage = dbUser.profileImage || dbUser.image
            }
            
            token.language = dbUser.language
            token.theme = dbUser.theme
            token.backgroundImage = dbUser.backgroundImage
            token.backgroundBlur = dbUser.backgroundBlur
            token.backgroundBrightness = dbUser.backgroundBrightness
            token.backgroundOpacity = dbUser.backgroundOpacity
          }
        } else {
          // For credentials users
          const pUser = user as NextAuthUser
          const t = token as Tokenish
          t.id = pUser.id
          t.username = pUser.username
          t.displayName = pUser.displayName
          t.profileImage = pUser.profileImage || pUser.image
          t.language = pUser.language || 'en'
          t.theme = pUser.theme || 'dark'
          t.backgroundImage = pUser.backgroundImage
          t.backgroundBlur = pUser.backgroundBlur ?? 0
          t.backgroundBrightness = pUser.backgroundBrightness ?? 70
          t.backgroundOpacity = pUser.backgroundOpacity ?? 0.1
          
        }
      }

      return token
    },
    
    async session({ session, token }) {
      
      if (token && session.user) {
        const t = token as Tokenish
        const sUser = session.user as NextAuthUser
        sUser.id = t.id as string | undefined
        sUser.username = t.username as string | undefined
        sUser.displayName = t.displayName as string | undefined
  sUser.profileImage = (t as any).profileImage as string | undefined
  sUser.image = (t as any).profileImage as string | undefined
        sUser.language = (t.language as string) || undefined
        sUser.theme = (t.theme as 'light' | 'dark' | 'system') || undefined
        sUser.backgroundImage = t.backgroundImage as string | undefined
        sUser.backgroundBlur = (t.backgroundBlur as number) ?? undefined
        sUser.backgroundBrightness = (t.backgroundBrightness as number) ?? undefined
        sUser.backgroundOpacity = (t.backgroundOpacity as number) ?? undefined
        
      }
      
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error' // Custom error page
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}
