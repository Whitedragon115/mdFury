// Simple client-side authentication for demo purposes
// In a real application, this would be handled by a backend server

export interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  profileImage?: string
  language: string
  theme: 'light' | 'dark' | 'system'
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
}

// Mock user database for demo
interface UserData {
  id: string
  username: string
  email: string
  password: string
  displayName: string
  profileImage: string
  language: string
  theme: 'light' | 'dark' | 'system'
  createdAt: string
  lastLogin: string
}

const users: UserData[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    displayName: 'Administrator',
    profileImage: '',
    language: 'en',
    theme: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: '2', 
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123',
    displayName: 'Demo User',
    profileImage: '',
    language: 'en',
    theme: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  }
]

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
        email: decoded.email,
        displayName: decoded.displayName || decoded.username,
        profileImage: decoded.profileImage || '',
        language: decoded.language || 'en',
        theme: decoded.theme || 'system'
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

    const userWithoutPassword: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      profileImage: user.profileImage,
      language: user.language,
      theme: user.theme
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

  static async updateUserProfile(userId: string, updates: Partial<Omit<User, 'id' | 'username' | 'email'>>): Promise<{ success: boolean; user?: User; message?: string }> {
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      }
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      lastLogin: new Date().toISOString()
    }

    const updatedUser: User = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      displayName: users[userIndex].displayName,
      profileImage: users[userIndex].profileImage,
      language: users[userIndex].language,
      theme: users[userIndex].theme
    }

    return {
      success: true,
      user: updatedUser
    }
  }

  static getAllUsers(): UserProfile[] {
    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      profileImage: user.profileImage,
      language: user.language,
      theme: user.theme,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }))
  }
}
