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
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
  createdAt: string
  lastLogin: string
}

// Default users
const defaultUsers: UserData[] = [
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

// Load users from localStorage or use defaults
const loadUsers = (): UserData[] => {
  if (typeof window === 'undefined') return defaultUsers
  
  try {
    const stored = localStorage.getItem('mdbin_users')
    if (stored) {
      const parsedUsers: UserData[] = JSON.parse(stored)
      // Merge with defaults to ensure all users exist
      const userMap = new Map(parsedUsers.map((u: UserData) => [u.id, u]))
      defaultUsers.forEach(defaultUser => {
        if (!userMap.has(defaultUser.id)) {
          userMap.set(defaultUser.id, defaultUser)
        }
      })
      return Array.from(userMap.values())
    }
  } catch (error) {
    console.warn('Failed to load users from localStorage:', error)
  }
  
  return defaultUsers
}

// Save users to localStorage
const saveUsers = (users: UserData[]) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('mdbin_users', JSON.stringify(users))
  } catch (error) {
    console.warn('Failed to save users to localStorage:', error)
  }
}

// Initialize users
let users: UserData[] = loadUsers()

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
      
      // Reload users to get the latest data from localStorage
      users = loadUsers()
      
      // Find the current user in the fresh data
      const currentUser = users.find(u => u.id === decoded.id)
      if (!currentUser) {
        return null
      }
      
      return {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        displayName: currentUser.displayName,
        profileImage: currentUser.profileImage || '',
        language: currentUser.language,
        theme: currentUser.theme,
        backgroundImage: currentUser.backgroundImage || '',
        backgroundBlur: currentUser.backgroundBlur ?? 0,
        backgroundBrightness: currentUser.backgroundBrightness ?? 50
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

    // Update last login time
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString()
      saveUsers(users)
    }

    const userWithoutPassword: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      profileImage: user.profileImage,
      language: user.language,
      theme: user.theme,
      backgroundImage: user.backgroundImage || '',
      backgroundBlur: user.backgroundBlur ?? 0,
      backgroundBrightness: user.backgroundBrightness ?? 50
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

  static async updateUserProfile(userId: string, updates: Partial<Omit<User, 'id' | 'username' | 'email'>>): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
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

    // Save to localStorage
    saveUsers(users)

    const updatedUser: User = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      displayName: users[userIndex].displayName,
      profileImage: users[userIndex].profileImage,
      language: users[userIndex].language,
      theme: users[userIndex].theme,
      backgroundImage: users[userIndex].backgroundImage || '',
      backgroundBlur: users[userIndex].backgroundBlur ?? 0,
      backgroundBrightness: users[userIndex].backgroundBrightness ?? 50
    }

    // Generate new token with updated user data
    const newToken = this.generateToken(updatedUser)

    return {
      success: true,
      user: updatedUser,
      token: newToken
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
      backgroundImage: user.backgroundImage || '',
      backgroundBlur: user.backgroundBlur ?? 0,
      backgroundBrightness: user.backgroundBrightness ?? 50,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }))
  }
}
