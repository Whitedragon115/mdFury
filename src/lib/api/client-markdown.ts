// Client-side markdown storage service using API routes
export interface SavedMarkdown {
  id: string
  userId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags: string[]
  isPublic: boolean
  binId?: string
  password?: string
}

export interface CreateMarkdownData {
  title: string
  content: string
  tags?: string[]
  isPublic?: boolean
  binId?: string
  password?: string
}

export interface UpdateMarkdownData {
  title?: string
  content?: string
  tags?: string[]
  isPublic?: boolean
  binId?: string
  password?: string
}

export class ClientMarkdownService {
  static getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('auth_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  static async getUserMarkdowns(): Promise<SavedMarkdown[]> {
    try {
      const response = await fetch('/api/markdowns', {
        headers: this.getAuthHeaders(),
      })

      const result = await response.json()
      return result.success ? result.markdowns : []
    } catch (error) {
      console.error('Failed to get user markdowns:', error)
      return []
    }
  }

  static async saveMarkdown(data: CreateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    try {
      const response = await fetch('/api/markdowns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to save markdown:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async updateMarkdown(id: string, data: UpdateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    try {
      const response = await fetch(`/api/markdowns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to update markdown:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async deleteMarkdown(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`/api/markdowns/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to delete markdown:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
  static async getPublicMarkdown(binId: string, password?: string): Promise<{ 
    success: boolean; 
    markdown?: SavedMarkdown; 
    message?: string;
    passwordRequired?: boolean;
    requiresAuth?: boolean;
    accessDenied?: boolean;
  }> {
    try {
      const url = password 
        ? `/api/public/${binId}?password=${encodeURIComponent(password)}`
        : `/api/public/${binId}`
      
      // Include auth headers if user is logged in
      const headers: { [key: string]: string } = {}
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(url, { headers })
      const data = await response.json()
      
      // Handle different status codes
      if (response.status === 423) {
        // Password required
        return {
          success: false,
          passwordRequired: true,
          message: data.message || 'Password required'
        }
      } else if (response.status === 401) {
        // Authentication required
        return {
          success: false,
          requiresAuth: true,
          message: data.message || 'Authentication required'
        }
      } else if (response.status === 403) {
        // Access denied
        return {
          success: false,
          accessDenied: true,
          message: data.message || 'Access denied'
        }
      } else if (response.status === 404) {
        // Not found
        return {
          success: false,
          message: data.message || 'Document not found'
        }
      }
      
      return data
    } catch (error) {
      console.error('Failed to get public markdown:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static generateId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static validateBinId(binId: string): { valid: boolean; message?: string } {
    if (!binId) {
      return { valid: false, message: 'Bin ID is required' }
    }
    
    if (binId.length > 128) {
      return { valid: false, message: 'Bin ID must be 128 characters or less' }
    }
    
    // Only allow A-Z, a-z, 0-9, and hyphen (-)
    const validPattern = /^[A-Za-z0-9-]+$/
    if (!validPattern.test(binId)) {
      return { valid: false, message: 'Bin ID can only contain letters, numbers, and hyphens' }
    }
    
    return { valid: true }
  }
}
