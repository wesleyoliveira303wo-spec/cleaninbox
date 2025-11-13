// Types para o CleanInbox AI

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  created_at?: string
}

export interface UserToken {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: number
  updated_at?: string
}

export interface EmailMessage {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
  threadId?: string
}

export interface EmailClassification {
  index: number
  category: 'Importante' | 'Promoção' | 'Lixo'
  reason: string
}

export interface AnalysisResult {
  classifications: EmailClassification[]
  summary: {
    important: number
    promotion: number
    junk: number
  }
}

export interface CleanHistory {
  id: string
  user_id: string
  summary: {
    important: number
    promotion: number
    junk: number
    deleted: number
    archived: number
  }
  classifications: EmailClassification[]
  created_at: string
}

export interface GmailListResponse {
  messages?: Array<{ id: string; threadId: string }>
  nextPageToken?: string
  resultSizeEstimate?: number
}

export interface GmailMessageResponse {
  id: string
  threadId: string
  labelIds?: string[]
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body?: {
      data?: string
    }
  }
  internalDate: string
}
