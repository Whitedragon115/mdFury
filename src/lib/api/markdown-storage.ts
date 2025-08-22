// Server-side markdown storage using Prisma and MySQL database
import { prisma } from '../database'

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
  isPrivate?: boolean  // For backward compatibility
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

export class MarkdownStorageService {
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

  static async getUserMarkdowns(userId: string): Promise<SavedMarkdown[]> {
    try {
      const markdowns = await prisma.markdown.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      })

      return markdowns.map(doc => ({
        id: doc.id,
        userId: doc.userId,
        title: doc.title,
        content: doc.content,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        isPublic: doc.isPublic,
        binId: doc.binId,
        password: doc.password || undefined,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      }))
    } catch (error) {
      console.error('Failed to get user markdowns:', error)
      return []
    }
  }

  static async getMarkdownById(id: string, userId?: string): Promise<SavedMarkdown | null> {
    try {
      const markdown = await prisma.markdown.findUnique({
        where: { id }
      })
      
      if (!markdown) return null
      
      // Check if user has access to this document
      if (markdown.userId !== userId && !markdown.isPublic) {
        return null
      }
      
      return {
        id: markdown.id,
        userId: markdown.userId,
        title: markdown.title,
        content: markdown.content,
        tags: markdown.tags ? JSON.parse(markdown.tags) : [],
        isPublic: markdown.isPublic,
        binId: markdown.binId,
        password: markdown.password || undefined,
        createdAt: markdown.createdAt.toISOString(),
        updatedAt: markdown.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Failed to get markdown by id:', error)
      return null
    }
  }

  static async saveMarkdown(userId: string, data: CreateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    try {
      const binId = data.binId || this.generateId()
      
      // Validate binId format
      const validation = this.validateBinId(binId)
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message
        }
      }
      
      // Check if binId already exists (search both id and binId fields)
      const existingDoc = await prisma.markdown.findFirst({
        where: {
          OR: [
            { id: binId },
            { binId: binId }
          ]
        }
      })

      if (existingDoc) {
        return {
          success: false,
          message: 'Bin ID already exists. Please choose a different ID.'
        }
      }
        const newMarkdown = await prisma.markdown.create({
        data: {
          binId: binId,
          userId,
          title: data.title.trim() || 'Untitled Document',
          content: data.content,
          tags: data.tags ? JSON.stringify(data.tags) : null,
          // If password is provided, force document to be public
          // Handle both isPublic and isPrivate for backward compatibility
          isPublic: data.password ? true : (
            data.isPublic !== undefined ? data.isPublic :
            data.isPrivate !== undefined ? !data.isPrivate :
            true // Default to public
          ),
          password: data.password || null
        }
      })
      
      return {
        success: true,
        markdown: {
          id: newMarkdown.id,
          userId: newMarkdown.userId,
          title: newMarkdown.title,
          content: newMarkdown.content,
          tags: newMarkdown.tags ? JSON.parse(newMarkdown.tags) : [],
          isPublic: newMarkdown.isPublic,
          binId: newMarkdown.binId,
          password: newMarkdown.password || undefined,
          createdAt: newMarkdown.createdAt.toISOString(),
          updatedAt: newMarkdown.updatedAt.toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to save markdown:', error)
      return {
        success: false,
        message: 'Failed to save document'
      }
    }
  }

  static async updateMarkdown(id: string, userId: string, data: UpdateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    try {
      // Check if document exists and user has access
      const existingDoc = await prisma.markdown.findFirst({
        where: { id, userId }
      })
      
      if (!existingDoc) {
        return {
          success: false,
          message: 'Document not found or access denied'
        }
      }

      // If binId is being updated, check for conflicts and validate format
      if (data.binId && data.binId !== existingDoc.binId) {
        // Validate binId format
        const validation = this.validateBinId(data.binId)
        if (!validation.valid) {
          return {
            success: false,
            message: validation.message
          }
        }
        
        const conflictDoc = await prisma.markdown.findFirst({
          where: {
            OR: [
              { id: data.binId },
              { binId: data.binId }
            ],
            NOT: { id: id } // Exclude current document
          }
        })

        if (conflictDoc) {
          return {
            success: false,
            message: 'Bin ID already exists. Please choose a different ID.'
          }
        }
      }
        const updatedMarkdown = await prisma.markdown.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title.trim() || 'Untitled Document' }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.tags !== undefined && { tags: JSON.stringify(data.tags) }),
          ...(data.binId !== undefined && { binId: data.binId }),
          // Handle password and isPublic logic
          ...(data.password !== undefined && { password: data.password || null }),
          // If password is being set or already exists, force document to be public
          ...(data.isPublic !== undefined && { 
            isPublic: (data.password || existingDoc.password) ? true : data.isPublic 
          }),
          // If only password is being changed, make sure document stays public
          ...((data.password !== undefined && data.password) && { isPublic: true })
        }
      })
      
      return {
        success: true,
        markdown: {
          id: updatedMarkdown.id,
          userId: updatedMarkdown.userId,
          title: updatedMarkdown.title,
          content: updatedMarkdown.content,
          tags: updatedMarkdown.tags ? JSON.parse(updatedMarkdown.tags) : [],
          isPublic: updatedMarkdown.isPublic,
          binId: updatedMarkdown.binId,
          password: updatedMarkdown.password || undefined,
          createdAt: updatedMarkdown.createdAt.toISOString(),
          updatedAt: updatedMarkdown.updatedAt.toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to update markdown:', error)
      return {
        success: false,
        message: 'Failed to update document'
      }
    }
  }

  static async deleteMarkdown(id: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const deletedDoc = await prisma.markdown.deleteMany({
        where: { id, userId }
      })
      
      if (deletedDoc.count === 0) {
        return {
          success: false,
          message: 'Document not found or access denied'
        }
      }
      
      return {
        success: true
      }
    } catch (error) {
      console.error('Failed to delete markdown:', error)
      return {
        success: false,
        message: 'Failed to delete document'
      }
    }
  }

  static async getPublicMarkdowns(): Promise<SavedMarkdown[]> {
    try {
      const markdowns = await prisma.markdown.findMany({
        where: { isPublic: true },
        orderBy: { updatedAt: 'desc' }
      })

      return markdowns.map(doc => ({
        id: doc.id,
        userId: doc.userId,
        title: doc.title,
        content: doc.content,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        isPublic: doc.isPublic,
        binId: doc.binId,
        password: doc.password || undefined,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      }))
    } catch (error) {
      console.error('Failed to get public markdowns:', error)
      return []
    }
  }

  static async getPublicMarkdown(binId: string, password?: string, userId?: string): Promise<{ 
    success: boolean; 
    markdown?: SavedMarkdown; 
    message?: string;
    passwordRequired?: boolean;
    requiresAuth?: boolean;
    accessDenied?: boolean;
  }> {
    try {
      // Search by binId first, then fall back to id for backwards compatibility
      const markdown = await prisma.markdown.findFirst({
        where: {
          OR: [
            { binId: binId },
            { id: binId }
          ]
        }
      })
      
      if (!markdown) {
        return {
          success: false,
          message: 'Document not found'
        }
      }

      // Step 1: Check if document is private and requires authentication
      if (!markdown.isPublic) {
        if (!userId) {
          return {
            success: false,
            requiresAuth: true,
            message: 'This document is private. Please login to view it.'
          }
        }
        
        // Step 2: Check if user has permission to access private document
        if (userId !== markdown.userId) {
          return {
            success: false,
            accessDenied: true,
            message: 'You do not have permission to access this document.'
          }
        }
      }
      
      // Step 3: Check password protection (only after auth and permission checks)
      if (markdown.password) {
        
        if (!password) {
          return {
            success: false,
            passwordRequired: true,
            message: ''
          }
        }
        
        if (password !== markdown.password) {
          return {
            success: false,
            passwordRequired: true,
            message: 'Incorrect password. Please try again.'
          }
        }
      }

      return {
        success: true,
        markdown: {
          id: markdown.id,
          userId: markdown.userId,
          title: markdown.title,
          content: markdown.content,
          tags: markdown.tags ? JSON.parse(markdown.tags) : [],
          isPublic: markdown.isPublic,
          binId: markdown.binId,
          password: markdown.password || undefined,
          createdAt: markdown.createdAt.toISOString(),
          updatedAt: markdown.updatedAt.toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to get public markdown:', error)
      return {
        success: false,
        message: 'Failed to load document'
      }
    }
  }

  static async searchMarkdowns(userId: string, query: string): Promise<SavedMarkdown[]> {
    try {
      const searchTerm = query.toLowerCase().trim()
      
      if (!searchTerm) {
        return this.getUserMarkdowns(userId)
      }

      const markdowns = await prisma.markdown.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
            { tags: { contains: searchTerm } }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      })

      return markdowns.map(doc => ({
        id: doc.id,
        userId: doc.userId,
        title: doc.title,
        content: doc.content,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        isPublic: doc.isPublic,
        binId: doc.binId,
        password: doc.password || undefined,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      }))
    } catch (error) {
      console.error('Failed to search markdowns:', error)
      return []
    }
  }

  // Helper method to create demo documents
  static async createDemoDocuments() {
    try {
      // Check if demo documents already exist
      const existingDocs = await prisma.markdown.findMany({
        where: { binId: { in: ['welcome', 'demo'] } }
      })

      if (existingDocs.length === 0) {
        // Get demo users
        const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } })
        const demoUser = await prisma.user.findUnique({ where: { username: 'demo' } })

        if (adminUser) {
          await prisma.markdown.create({
            data: {
              binId: 'welcome',
              userId: adminUser.id,
              title: 'Welcome Document',
              content: `# Welcome to Markdown Previewer

This is your first saved document! You can:

- Create and edit markdown documents
- Save them to your account
- Organize with tags
- Share publicly or keep private

## Getting Started

Start by clicking the "Save" button to save your current markdown content.

### Happy writing! ✨
`,
              tags: JSON.stringify(['welcome', 'tutorial']),
              isPublic: false
            }
          })
        }

        if (demoUser) {
          await prisma.markdown.create({
            data: {
              binId: 'demo',
              userId: demoUser.id,
              title: 'Demo Document',
              content: `# Demo Document

This is a sample document for the demo user.

## Features Demo

- **Bold text**
- *Italic text*
- \`inline code\`

\`\`\`javascript
// Code block example
function hello() {
  console.log('Hello World!');
}
\`\`\`

> Blockquote example

### Table Example

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
`,
              tags: JSON.stringify(['demo', 'example']),
              isPublic: true
            }
          })
        }
      }
    } catch (error) {
      console.warn('Failed to create demo documents:', error)
    }
  }
}
