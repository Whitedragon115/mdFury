'use client'

import { ClientMarkdownService } from './client-markdown'
import { ClientOAuthMarkdownService } from './client-oauth-markdown'
import { SavedMarkdown, CreateMarkdownData, UpdateMarkdownData } from '@/types'

/**
 * Integrated client markdown service that automatically chooses between OAuth and credential APIs
 */
export class IntegratedMarkdownService {
  
  /**
   * Check if user is using OAuth authentication
   */
  private static async isOAuthUser(): Promise<boolean> {
    try {
      // First check if there's an active credential token
      const token = localStorage.getItem('auth_token')
      if (token) {
        // If there's a credential token, prioritize credentials
        return false
      }

      // Only check OAuth if no credential token exists
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      return !!session?.user
    } catch (_error) {
      return false
    }
  }

  /**
   * Get user's markdowns using the appropriate API
   */
  static async getUserMarkdowns(): Promise<SavedMarkdown[]> {
    const isOAuth = await this.isOAuthUser()
    
    if (isOAuth) {
      return ClientOAuthMarkdownService.getUserMarkdowns()
    } else {
      // Convert the client markdown service response to match types
      const markdowns = await ClientMarkdownService.getUserMarkdowns()
      
      const convertedMarkdowns = markdowns.map(doc => ({
        ...doc,
        createdAt: typeof doc.createdAt === 'string' ? new Date(doc.createdAt) : doc.createdAt,
        updatedAt: typeof doc.updatedAt === 'string' ? new Date(doc.updatedAt) : doc.updatedAt,
      }))
      
      return convertedMarkdowns
    }
  }

  /**
   * Save markdown using the appropriate API
   */
  static async saveMarkdown(data: CreateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    const isOAuth = await this.isOAuthUser()
    
    if (isOAuth) {
      return ClientOAuthMarkdownService.saveMarkdown(data)
    } else {
      const result = await ClientMarkdownService.saveMarkdown(data)
      return {
        ...result,
        markdown: result.markdown ? {
          ...result.markdown,
          createdAt: typeof result.markdown.createdAt === 'string' ? new Date(result.markdown.createdAt) : result.markdown.createdAt,
          updatedAt: typeof result.markdown.updatedAt === 'string' ? new Date(result.markdown.updatedAt) : result.markdown.updatedAt,
        } : undefined
      }
    }
  }

  /**
   * Update markdown using the appropriate API
   */
  static async updateMarkdown(id: string, data: UpdateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    const isOAuth = await this.isOAuthUser()
    
    if (isOAuth) {
      return ClientOAuthMarkdownService.updateMarkdown(id, data)
    } else {
      const result = await ClientMarkdownService.updateMarkdown(id, data)
      return {
        ...result,
        markdown: result.markdown ? {
          ...result.markdown,
          createdAt: typeof result.markdown.createdAt === 'string' ? new Date(result.markdown.createdAt) : result.markdown.createdAt,
          updatedAt: typeof result.markdown.updatedAt === 'string' ? new Date(result.markdown.updatedAt) : result.markdown.updatedAt,
        } : undefined
      }
    }
  }

  /**
   * Delete markdown using the appropriate API
   */
  static async deleteMarkdown(id: string): Promise<{ success: boolean; message?: string }> {
    const isOAuth = await this.isOAuthUser()
    
    if (isOAuth) {
      return ClientOAuthMarkdownService.deleteMarkdown(id)
    } else {
      return ClientMarkdownService.deleteMarkdown(id)
    }
  }

  /**
   * Get markdown by ID using the appropriate API
   */
  static async getMarkdownById(id: string): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    const isOAuth = await this.isOAuthUser()
    
    if (isOAuth) {
      return ClientOAuthMarkdownService.getMarkdownById(id)
    } else {
      // Credential users don't have this method, use getUserMarkdowns and filter
      const markdowns = await this.getUserMarkdowns()
      const markdown = markdowns.find(m => m.id === id || m.binId === id)
      
      if (markdown) {
        return { success: true, markdown }
      } else {
        return { success: false, message: 'Document not found' }
      }
    }
  }

  /**
   * Get public markdown (works for both OAuth and credential users)
   */
  static async getPublicMarkdown(binId: string, password?: string): Promise<{ 
    success: boolean; 
    markdown?: SavedMarkdown; 
    message?: string;
    passwordRequired?: boolean;
    requiresAuth?: boolean;
    accessDenied?: boolean;
  }> {
    try {
      // For public documents, we need to check authentication and route appropriately

      const url = password 
        ? `/api/public/${binId}?password=${encodeURIComponent(password)}`
        : `/api/public/${binId}`
      
      // Include auth headers based on user type
      const headers: { [key: string]: string } = {}
      
      // Check for OAuth session first
      const isOAuth = await this.isOAuthUser()
      if (isOAuth) {
        // OAuth users don't need explicit auth headers for public endpoints
        // The session is handled server-side
      } else {
        // Credential users need the token header
        const token = localStorage.getItem('auth_token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }
      
      const response = await fetch(url, { headers })
      const data = await response.json()

      // Handle different status codes
      if (response.status === 406) {
        return {
          success: false,
          passwordRequired: true,
          message: data.message || 'Password required'
        }
      } else if (response.status === 401) {
        return {
          success: false,
          requiresAuth: true,
          message: data.message || 'Authentication required'
        }
      } else if (response.status === 403) {
        return {
          success: false,
          accessDenied: true,
          message: data.message || 'Access denied'
        }
      } else if (response.status === 404) {
        return {
          success: false,
          message: data.message || 'Document not found'
        }
      }
      
      // Success case - normalize dates
      return {
        ...data,
        markdown: data.markdown ? {
          ...data.markdown,
          createdAt: typeof data.markdown.createdAt === 'string' ? new Date(data.markdown.createdAt) : data.markdown.createdAt,
          updatedAt: typeof data.markdown.updatedAt === 'string' ? new Date(data.markdown.updatedAt) : data.markdown.updatedAt,
        } : undefined
      }
    } catch (error) {
      console.error('Failed to get public markdown:', error)
      return {
        success: false,
        message: 'Failed to load document'
      }
    }
  }

  /**
   * Validate binId format
   */
  static validateBinId(binId: string): { valid: boolean; message?: string } {
    return ClientMarkdownService.validateBinId(binId)
  }

  /**
   * Generate a new bin ID
   */
  static generateBinId(): string {
    return ClientMarkdownService.generateId()
  }
}
