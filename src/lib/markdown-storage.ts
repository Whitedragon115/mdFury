// Simple client-side markdown storage for demo purposes
// In a real application, this would be handled by a backend server

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

// Mock storage
let markdownStorage: SavedMarkdown[] = [
  {
    id: '1',
    userId: '1',
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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['welcome', 'tutorial'],
    isPublic: false
  },
  {
    id: '2',
    userId: '2',
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
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    tags: ['demo', 'example'],
    isPublic: true
  }
]

export class MarkdownStorageService {
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  static async getUserMarkdowns(userId: string): Promise<SavedMarkdown[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return markdownStorage
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  static async getMarkdownById(id: string, userId?: string): Promise<SavedMarkdown | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const markdown = markdownStorage.find(doc => doc.id === id)
    
    if (!markdown) return null
    
    // Check if user has access to this document
    if (markdown.userId !== userId && !markdown.isPublic) {
      return null
    }
    
    return markdown
  }

  static async saveMarkdown(userId: string, data: CreateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const now = new Date().toISOString()
    const markdownId = data.binId || this.generateId()
    
    // Check if binId already exists
    if (data.binId && markdownStorage.some(doc => doc.id === data.binId || doc.binId === data.binId)) {
      return {
        success: false,
        message: 'Bin ID already exists. Please choose a different ID.'
      }
    }
    
    const newMarkdown: SavedMarkdown = {
      id: markdownId,
      userId,
      title: data.title.trim() || 'Untitled Document',
      content: data.content,
      tags: data.tags || [],
      isPublic: data.isPublic || false,
      binId: data.binId,
      password: data.password,
      createdAt: now,
      updatedAt: now
    }
    
    markdownStorage.push(newMarkdown)
    
    return {
      success: true,
      markdown: newMarkdown
    }
  }

  static async updateMarkdown(id: string, userId: string, data: UpdateMarkdownData): Promise<{ success: boolean; markdown?: SavedMarkdown; message?: string }> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const markdownIndex = markdownStorage.findIndex(doc => doc.id === id && doc.userId === userId)
    
    if (markdownIndex === -1) {
      return {
        success: false,
        message: 'Document not found or access denied'
      }
    }
    
    const updatedMarkdown = {
      ...markdownStorage[markdownIndex],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    if (data.title !== undefined) {
      updatedMarkdown.title = data.title.trim() || 'Untitled Document'
    }
    
    markdownStorage[markdownIndex] = updatedMarkdown
    
    return {
      success: true,
      markdown: updatedMarkdown
    }
  }

  static async deleteMarkdown(id: string, userId: string): Promise<{ success: boolean; message?: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const markdownIndex = markdownStorage.findIndex(doc => doc.id === id && doc.userId === userId)
    
    if (markdownIndex === -1) {
      return {
        success: false,
        message: 'Document not found or access denied'
      }
    }
    
    markdownStorage.splice(markdownIndex, 1)
    
    return {
      success: true
    }
  }

  static async getPublicMarkdowns(): Promise<SavedMarkdown[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return markdownStorage
      .filter(doc => doc.isPublic)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  static async getPublicMarkdown(id: string, password?: string): Promise<{ 
    success: boolean; 
    markdown?: SavedMarkdown; 
    message?: string;
    passwordRequired?: boolean;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const markdown = markdownStorage.find(doc => doc.id === id)
    
    if (!markdown) {
      return {
        success: false,
        message: 'Document not found'
      }
    }

    // Check if document is public or user has correct password
    if (!markdown.isPublic && !markdown.password) {
      return {
        success: false,
        message: 'Document is private'
      }
    }

    // If document has password protection
    if (markdown.password) {
      if (!password) {
        return {
          success: false,
          passwordRequired: true
        }
      }
      
      if (password !== markdown.password) {
        return {
          success: false,
          message: 'Incorrect password'
        }
      }
    }

    return {
      success: true,
      markdown
    }
  }

  static async searchMarkdowns(userId: string, query: string): Promise<SavedMarkdown[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const userMarkdowns = markdownStorage.filter(doc => doc.userId === userId)
    const searchTerm = query.toLowerCase().trim()
    
    if (!searchTerm) return userMarkdowns
    
    return userMarkdowns.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }
}
