// Simple client-side authentication for demo purposes
// In a real application, this would be handled by a backend server

// Mock user database for demo
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
  },
  {
    id: '2', 
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123',
  }
]

export interface User {
  id: string
  username: string
  email: string
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
      timestamp: Date.now()
    }))
  }

  static verifyToken(token: string): User | null {
    try {
      const decoded = JSON.parse(atob(token))
      // Check if token is not older than 24 hours
      const isValid = (Date.now() - decoded.timestamp) < (24 * 60 * 60 * 1000)
      
      if (!isValid) {
        return null
      }
      
      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      }
    } catch (error) {
      return null
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = users.find(u => u.username === credentials.username)
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      }
    }

    // Simple password comparison for demo
    const isPasswordValid = credentials.password === user.password
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password'
      }
    }

    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email
    }

    const token = this.generateToken(userWithoutPassword)

    return {
      success: true,
      user: userWithoutPassword,
      token
    }
  }

  static getUserByToken(token: string): User | null {
    return this.verifyToken(token)
  }
}
