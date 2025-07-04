// Server-side authentication using Prisma and MySQL database
import { prisma } from '../database'
import bcrypt from 'bcryptjs'

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

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  confirmPassword: string
  displayName?: string
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
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        profileImage: user.profileImage || '',
        language: user.language,
        theme: user.theme as 'light' | 'dark' | 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur,
        backgroundBrightness: user.backgroundBrightness,
        backgroundOpacity: user.backgroundOpacity
      }
    } catch (error) {
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
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        profileImage: user.profileImage || '',
        language: user.language,
        theme: user.theme as 'light' | 'dark' | 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur,
        backgroundBrightness: user.backgroundBrightness,
        backgroundOpacity: user.backgroundOpacity
      }

      const token = this.generateToken(userWithoutPassword)

      return {
        success: true,
        user: userWithoutPassword,
        token
      }
    } catch (error) {
      return {
        success: false,
        message: 'Login failed'
      }
    }
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      if (!credentials.username || !credentials.email || !credentials.password) {
        return {
          success: false,
          message: 'Username, email, and password are required'
        }
      }

      if (credentials.password !== credentials.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        }
      }

      if (credentials.password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long'
        }
      }

      // Check if username already exists
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username: credentials.username }
      })

      if (existingUserByUsername) {
        return {
          success: false,
          message: 'Username already exists'
        }
      }

      // Check if email already exists
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: credentials.email }
      })

      if (existingUserByEmail) {
        return {
          success: false,
          message: 'Email already exists'
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(credentials.password, 12)

      // Create user
      const newUser = await prisma.user.create({
        data: {
          username: credentials.username,
          email: credentials.email,
          password: hashedPassword,
          displayName: credentials.displayName || credentials.username,
          language: 'en',
          theme: 'dark'
        }
      })

      const userWithoutPassword: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName ?? newUser.username,
        profileImage: newUser.profileImage ?? '',
        language: newUser.language,
        theme: newUser.theme as 'light' | 'dark' | 'system',
        backgroundImage: newUser.backgroundImage ?? '',
        backgroundBlur: newUser.backgroundBlur,
        backgroundBrightness: newUser.backgroundBrightness,
        backgroundOpacity: newUser.backgroundOpacity
      }

      const token = this.generateToken(userWithoutPassword)

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Registration successful'
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      }
    }
  }

  static getUserByToken(token: string): Promise<User | null> {
    return this.verifyToken(token)
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
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName || updatedUser.username,
        profileImage: updatedUser.profileImage || '',
        language: updatedUser.language,
        theme: updatedUser.theme as 'light' | 'dark' | 'system',
        backgroundImage: updatedUser.backgroundImage || '',
        backgroundBlur: updatedUser.backgroundBlur,
        backgroundBrightness: updatedUser.backgroundBrightness,
        backgroundOpacity: updatedUser.backgroundOpacity
      }

      // Generate new token with updated user data
      const newToken = this.generateToken(userResponse)

      return {
        success: true,
        user: userResponse,
        token: newToken
      }
    } catch (error) {
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
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        profileImage: user.profileImage || '',
        language: user.language,
        theme: user.theme as 'light' | 'dark' | 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur,
        backgroundBrightness: user.backgroundBrightness,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin.toISOString()
      }))
    } catch (error) {
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
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        profileImage: user.profileImage || '',
        language: user.language,
        theme: user.theme as 'light' | 'dark' | 'system',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur,
        backgroundBrightness: user.backgroundBrightness,
        backgroundOpacity: user.backgroundOpacity
      }
    } catch (error) {
      console.error('Failed to get user by ID:', error)
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
}
