'use client'

import { getSession } from 'next-auth/react'
import { SavedMarkdown, CreateMarkdownData, UpdateMarkdownData } from '@/types'

/**
 * Client-side markdown service for OAuth users using NextAuth sessions
 */
export class ClientOAuthMarkdownService {

  /**
   * Get OAuth user's markdowns using NextAuth session
   */
  static async getUserMarkdowns(): Promise<SavedMarkdown[]> {
    try {
      const session = await getSession()
      if (!session?.user?.email) {
        console.error('No OAuth session found')
        return []
      }

      const response = await fetch('/api/auth/user-markdowns', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch user markdowns:', response.status)
        return []
      }

      const result = await response.json()
      return result.success ? result.markdowns : []
    } catch (error) {
      console.error('Failed to get OAuth user markdowns:', error)
      return []
    }
  }

  /**
   * Save markdown document for OAuth user
   */
  static async saveMarkdown(data: CreateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    try {
      const session = await getSession()
      if (!session?.user?.email) {
        return {
          success: false,
          message: 'Authentication required'
        }
      }

      const response = await fetch('/api/auth/save-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to save OAuth markdown:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  /**
   * Update markdown document for OAuth user
   */
  static async updateMarkdown(id: string, data: UpdateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    try {
      const session = await getSession()
      if (!session?.user?.email) {
        return {
          success: false,
          message: 'Authentication required'
        }
      }

      const response = await fetch(`/api/auth/update-markdown/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to update OAuth markdown:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  /**
   * Delete markdown document for OAuth user
   */
  static async deleteMarkdown(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const session = await getSession()
      if (!session?.user?.email) {
        return {
          success: false,
          message: 'Authentication required'
        }
      }

      const response = await fetch(`/api/auth/delete-markdown/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to delete OAuth markdown:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  /**
   * Get markdown by ID for OAuth user
   */
  static async getMarkdownById(id: string): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    try {
      const session = await getSession()
      if (!session?.user?.email) {
        return {
          success: false,
          message: 'Authentication required'
        }
      }

      const response = await fetch(`/api/auth/markdown/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to get OAuth markdown by ID:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  /**
   * Validate binId format
   */
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
