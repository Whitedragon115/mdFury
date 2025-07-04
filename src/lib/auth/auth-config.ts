import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../database'
import { AuthService } from './auth'
import bcrypt from 'bcryptjs'

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
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in (Google, GitHub)
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          // Check if OAuth registration is disabled
          if (process.env.DISABLE_OAUTH_REGISTRATION === 'true') {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email! }
            })
            
            if (!existingUser) {
              console.log('OAuth registration is disabled and user does not exist')
              return false // Deny sign-in for new users
            }
          }

          // Check if user exists in our database
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Auto-register user if OAuth registration is enabled
            if (process.env.DISABLE_OAUTH_REGISTRATION !== 'true') {
              // Generate a unique username from email or name
              let username = user.email!.split('@')[0]
              let displayName = user.name || username
              
              // Ensure username is unique
              let usernameExists = await prisma.user.findUnique({
                where: { username }
              })
              
              let counter = 1
              while (usernameExists) {
                username = `${user.email!.split('@')[0]}${counter}`
                usernameExists = await prisma.user.findUnique({
                  where: { username }
                })
                counter++
              }

              // Create new user with OAuth data
              existingUser = await prisma.user.create({
                data: {
                  username,
                  email: user.email!,
                  password: await bcrypt.hash(Math.random().toString(36), 12), // Random password
                  displayName,
                  profileImage: user.image || '',
                  language: 'en',
                  theme: 'dark'
                }
              })

              console.log(`Auto-registered new user via ${account.provider}:`, existingUser.username)
            } else {
              return false // Deny sign-in if registration is disabled
            }
          }

          // Update user info with latest OAuth data if needed
          if (existingUser && (existingUser.profileImage !== user.image || existingUser.displayName !== user.name)) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                profileImage: user.image || existingUser.profileImage,
                displayName: user.name || existingUser.displayName,
                lastLogin: new Date()
              }
            })
          }

          return true
        } catch (error) {
          console.error('OAuth sign-in error:', error)
          return false
        }
      }

      return true // Allow credentials sign-in
    },
    async jwt({ token, user, account }) {
      // Handle OAuth users
      if (account?.provider === 'google' || account?.provider === 'github') {
        // Fetch user data from database for OAuth users
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (dbUser) {
          token.id = dbUser.id
          token.username = dbUser.username
          token.displayName = dbUser.displayName
          token.language = dbUser.language
          token.theme = dbUser.theme
          token.backgroundImage = dbUser.backgroundImage
          token.backgroundBlur = dbUser.backgroundBlur
          token.backgroundBrightness = dbUser.backgroundBrightness
          token.backgroundOpacity = dbUser.backgroundOpacity
        }
      } else if (user) {
        // Handle credentials users
        token.id = user.id
        token.username = (user as any).username
        token.displayName = (user as any).displayName
        token.language = (user as any).language || 'en'
        token.theme = (user as any).theme || 'dark'
        token.backgroundImage = (user as any).backgroundImage
        token.backgroundBlur = (user as any).backgroundBlur || 0
        token.backgroundBrightness = (user as any).backgroundBrightness || 70
        token.backgroundOpacity = (user as any).backgroundOpacity || 0.1
      }

      // Always set default theme to dark if not present
      if (!token.theme) {
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
