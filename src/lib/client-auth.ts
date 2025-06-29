// Client-side authentication service using API routes
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

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export class ClientAuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      return await response.json()
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async verifyToken(token: string): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      return await response.json()
    } catch (error) {
      console.error('Token verification error:', error)
      return { success: false }
    }
  }

  static generateToken(user: User): string {
    // Simple token generation for demo (not secure for production)
    return btoa(JSON.stringify({
      id: user.id,
      username: user.username,
      timestamp: Date.now()
    }))
  }

  static getUserByToken(token: string): User | null {
    try {
      const decoded = JSON.parse(atob(token))
      if (decoded && decoded.id && decoded.username) {
        // In production, you would verify this token with the server
        return {
          id: decoded.id,
          username: decoded.username,
          email: '',
          displayName: decoded.username,
          language: 'en',
          theme: 'system'
        }
      }
    } catch (error) {
      console.error('Token decode error:', error)
    }
    return null
  }

  static getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('auth_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  static async updateProfile(updates: Partial<Omit<User, 'id' | 'username' | 'email'>>): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      })

      return await response.json()
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async getUserProfile(userId: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch(`/api/auth/profile/${userId}`, {
        headers: this.getAuthHeaders(),
      })

      return await response.json()
    } catch (error) {
      console.error('Get user profile error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}
