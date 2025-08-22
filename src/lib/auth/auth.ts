// Server-side authentication using Prisma and MySQL database
import { prisma } from '../database'
import bcrypt from 'bcryptjs'

// Default values for consistency
const DEFAULT_BACKGROUND_BRIGHTNESS = 70
const DEFAULT_BACKGROUND_OPACITY = 0.1

export interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  profileImage?: string
  language: string
  theme: 'light' | 'dark' | 'system'
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
  createdAt: string
  lastLogin: string
}

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  profileImage?: string
  language: string
  theme: 'light' | 'dark' | 'system'
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
  backgroundOpacity?: number
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  confirmPassword: string
  displayName?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export class AuthService {
  static generateToken(user: User): string {
    // Simple token generation for demo (not secure for production)
    return btoa(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      profileImage: user.profileImage,
      language: user.language,
      theme: user.theme,
      backgroundImage: user.backgroundImage,
      backgroundBlur: user.backgroundBlur,
      backgroundBrightness: user.backgroundBrightness,
      backgroundOpacity: user.backgroundOpacity,
      timestamp: Date.now()
    }))
  }

  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = JSON.parse(atob(token))
      // Check if token is not older than 24 hours
      const isValid = (Date.now() - decoded.timestamp) < (24 * 60 * 60 * 1000)

      if (!isValid) {
        return null
      }

      // Get fresh user data from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName || user.username || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur || 0,
        backgroundBrightness: user.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        backgroundOpacity: user.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }
    } catch (_error) {
      return null
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { username: credentials.username }
      })

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      if (!user.password) {
        return {
          success: false,
          message: 'Invalid password'
        }
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid password'
        }
      }

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })

      const userWithoutPassword: User = {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName || user.username || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur || 0,
        backgroundBrightness: user.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        backgroundOpacity: user.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }

      const token = this.generateToken(userWithoutPassword)

      return {
        success: true,
        user: userWithoutPassword,
        token
      }
    } catch (_error) {
      return {
        success: false,
        message: 'Login failed'
      }
    }
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      if (credentials.password !== credentials.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        }
      }

      if (credentials.password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters'
        }
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: credentials.username }
      })

      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists'
        }
      }

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email: credentials.email }
      })

      if (existingEmail) {
        return {
          success: false,
          message: 'Email already exists'
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(credentials.password, 10)

      // Create user
      const newUser = await prisma.user.create({
        data: {
          username: credentials.username,
          email: credentials.email,
          password: hashedPassword,
          displayName: credentials.displayName || credentials.username,
          language: 'en',
          theme: 'dark',
          backgroundBlur: 0,
          backgroundBrightness: 70,
          backgroundOpacity: 0.1,
          createdAt: new Date(),
          lastLogin: new Date()
        }
      })

      const userResponse: User = {
        id: newUser.id,
        username: newUser.username || '',
        email: newUser.email || '',
        displayName: newUser.displayName || newUser.username || '',
        profileImage: newUser.profileImage || '',
        language: newUser.language || 'en',
        theme: (newUser.theme as 'light' | 'dark' | 'system') || 'dark',
        backgroundImage: newUser.backgroundImage || '',
        backgroundBlur: newUser.backgroundBlur || 0,
        backgroundBrightness: newUser.backgroundBrightness || 70,
        backgroundOpacity: newUser.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }

      const token = this.generateToken(userResponse)

      return {
        success: true,
        user: userResponse,
        token
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return {
        success: false,
        message: 'Registration failed'
      }
    }
  }

  static getUserByToken(token: string): Promise<User | null> {
    // Check if it's an API token (starts with 'mdf_') or session token
    if (token.startsWith('mdf_')) {
      return this.getUserByApiToken(token)
    }
    return this.verifyToken(token)
  }

  static async getUserByApiToken(apiToken: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { apiToken }
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName || user.username || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'dark',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur || 0,
        backgroundBrightness: user.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        backgroundOpacity: user.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }
    } catch (error) {
      console.error('API token verification error:', error)
      return null
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<Omit<User, 'id' | 'username' | 'email'>>): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updates,
          lastLogin: new Date()
        }
      })

      const userResponse: User = {
        id: updatedUser.id,
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        displayName: updatedUser.displayName || updatedUser.username || '',
        profileImage: updatedUser.profileImage || '',
        language: updatedUser.language || 'en',
        theme: (updatedUser.theme as 'light' | 'dark' | 'system') || 'system',
        backgroundImage: updatedUser.backgroundImage || '',
        backgroundBlur: updatedUser.backgroundBlur || 0,
        backgroundBrightness: updatedUser.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        backgroundOpacity: updatedUser.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }

      // Generate new token with updated user data
      const newToken = this.generateToken(userResponse)

      return {
        success: true,
        user: userResponse,
        token: newToken
      }
    } catch (_error) {
      return {
        success: false,
        message: 'Failed to update profile'
      }
    }
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const users = await prisma.user.findMany()

      return users.map(user => ({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName || user.username || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur || 0,
        backgroundBrightness: user.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin.toISOString()
      }))
    } catch (_error) {
      return []
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName || user.username || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur || 0,
        backgroundBrightness: user.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        backgroundOpacity: user.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }
    } catch (error) {
      console.error('Failed to get user by ID:', error)
      return null
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email }
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName || user.username || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur || 0,
        backgroundBrightness: user.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        backgroundOpacity: user.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }
    } catch (error) {
      console.error('Failed to get user by email:', error)
      return null
    }
  }

  // Helper method to create demo users
  static async createDemoUsers() {
    try {
      // Check if demo users already exist
      const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } })
      const demoExists = await prisma.user.findUnique({ where: { username: 'demo' } })

      if (!adminExists) {
        await prisma.user.create({
          data: {
            username: 'admin',
            email: 'admin@example.com',
            password: await bcrypt.hash('admin123', 10),
            displayName: 'Administrator',
            language: 'en',
            theme: 'dark'
          }
        })
      }

      if (!demoExists) {
        await prisma.user.create({
          data: {
            username: 'demo',
            email: 'demo@example.com',
            password: await bcrypt.hash('demo123', 10),
            displayName: 'Demo User',
            language: 'en',
            theme: 'dark'
          }
        })
      }
    } catch (error) {
      console.warn('Failed to create demo users:', error)
    }
  }

  static async updateUserPassword(userId: string, hashedPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to update password:', error)
      return { success: false, error: 'Failed to update password' }
    }
  }

  static async updateUserEmail(userId: string, newEmail: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
      })

      if (existingUser && existingUser.id !== userId) {
        return { success: false, error: 'Email already exists' }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          email: newEmail,
          updatedAt: new Date()
        }
      })

      const userResponse: User = {
        id: updatedUser.id,
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        displayName: updatedUser.displayName || updatedUser.username || '',
        profileImage: updatedUser.profileImage || '',
        language: updatedUser.language || 'en',
        theme: (updatedUser.theme as 'light' | 'dark' | 'system') || 'system',
        backgroundImage: updatedUser.backgroundImage || '',
        backgroundBlur: updatedUser.backgroundBlur || 0,
        backgroundBrightness: updatedUser.backgroundBrightness || DEFAULT_BACKGROUND_BRIGHTNESS,
        backgroundOpacity: updatedUser.backgroundOpacity || DEFAULT_BACKGROUND_OPACITY
      }

      return { success: true, user: userResponse }
    } catch (error) {
      console.error('Failed to update email:', error)
      return { success: false, error: 'Failed to update email' }
    }
  }
}
