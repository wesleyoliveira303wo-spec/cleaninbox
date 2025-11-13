// User types
export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  provider: string
  created_at: string
}

export interface UserToken {
  user_id: string
  access_token: string
  refresh_token: string | null
  expires_at: number
  updated_at: string
}

// Email types
export interface GmailMessage {
  id: string
  threadId: string
  labelIds?: string[]
  snippet: string
  payload?: {
    headers: Array<{
      name: string
      value: string
    }>
    body?: {
      data?: string
    }
    parts?: Array<{
      mimeType: string
      body?: {
        data?: string
      }
    }>
  }
  internalDate?: string
}

export interface ParsedEmail {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
  body?: string
}

// Classification types
export interface EmailClassification {
  id: string
  category: 'Importante' | 'Promoção' | 'Lixo'
  reason: string
  confidence?: number
}

export interface ClassificationSummary {
  important: number
  promotion: number
  junk: number
}

export interface AnalysisResult {
  classifications: EmailClassification[]
  summary: ClassificationSummary
}

// Clean history types
export interface CleanHistory {
  id: string
  user_id: string
  summary: ClassificationSummary
  classifications: EmailClassification[]
  created_at: string
}

// Gmail API types
export interface GmailListResponse {
  messages?: Array<{ id: string; threadId: string }>
  nextPageToken?: string
  resultSizeEstimate?: number
}

export interface GmailModifyRequest {
  addLabelIds?: string[]
  removeLabelIds?: string[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
