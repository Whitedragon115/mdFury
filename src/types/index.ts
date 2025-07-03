// Common types used across the application

export interface User {
  id: string
  email: string
  username: string
  preferredTheme?: string
  backgroundType?: string
  backgroundImage?: string
  backgroundPattern?: string
  backgroundOpacity?: number
  createdAt: Date
  updatedAt: Date
}

export interface SavedMarkdown {
  id: string
  title: string
  content: string
  tags: string[]
  isPublic: boolean
  binId?: string
  password?: string
  userId?: string
  createdAt: Date
  updatedAt: Date
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

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
}
