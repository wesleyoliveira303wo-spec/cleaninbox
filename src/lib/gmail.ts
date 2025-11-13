import { google } from 'googleapis'
import { getUserToken, saveUserToken } from './supabase'
import type { EmailMessage, GmailListResponse, GmailMessageResponse } from './types'

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://mail.google.com/'
]

// Criar OAuth2 client
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

// Renovar access token usando refresh token
async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()
    return {
      access_token: credentials.access_token!,
      expires_at: credentials.expiry_date!
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error)
    throw new Error('Falha ao renovar token de acesso')
  }
}

// Obter cliente Gmail autenticado
export async function getGmailClient(userId: string) {
  const tokenData = await getUserToken(userId)
  
  if (!tokenData) {
    throw new Error('Token não encontrado para o usuário')
  }

  const oauth2Client = createOAuth2Client()
  
  // Verificar se o token expirou
  const now = Date.now()
  if (tokenData.expires_at < now) {
    // Token expirado, renovar
    const newToken = await refreshAccessToken(tokenData.refresh_token)
    
    // Salvar novo token
    await saveUserToken({
      user_id: userId,
      access_token: newToken.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: newToken.expires_at
    })
    
    oauth2Client.setCredentials({
      access_token: newToken.access_token,
      refresh_token: tokenData.refresh_token
    })
  } else {
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token
    })
  }

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

// Listar mensagens
export async function listMessages(
  userId: string,
  query?: string,
  maxResults = 100
): Promise<EmailMessage[]> {
  const gmail = await getGmailClient(userId)

  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults
  })

  const messages = response.data.messages || []
  
  // Buscar detalhes de cada mensagem
  const detailedMessages = await Promise.all(
    messages.map(async (msg) => {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      })

      const headers = details.data.payload?.headers || []
      const from = headers.find(h => h.name === 'From')?.value || ''
      const subject = headers.find(h => h.name === 'Subject')?.value || ''
      const date = headers.find(h => h.name === 'Date')?.value || ''

      return {
        id: msg.id!,
        from,
        subject,
        snippet: details.data.snippet || '',
        date,
        threadId: msg.threadId
      }
    })
  )

  return detailedMessages
}

// Ler mensagem específica
export async function readMessage(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId)

  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  })

  return response.data
}

// Deletar mensagem
export async function deleteMessage(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId)

  await gmail.users.messages.delete({
    userId: 'me',
    id: messageId
  })

  return { success: true, messageId }
}

// Arquivar mensagem (remover label INBOX)
export async function archiveMessage(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId)

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['INBOX']
    }
  })

  return { success: true, messageId }
}

// Marcar como lida
export async function markAsRead(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId)

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['UNREAD']
    }
  })

  return { success: true, messageId }
}

// Buscar e-mails por categoria
export async function searchByCategory(userId: string, category: 'promotions' | 'social' | 'updates') {
  const queries: Record<string, string> = {
    promotions: 'category:promotions',
    social: 'category:social',
    updates: 'category:updates'
  }

  return listMessages(userId, queries[category])
}

// Buscar e-mails antigos (mais de X dias)
export async function searchOldEmails(userId: string, daysOld = 30) {
  const date = new Date()
  date.setDate(date.getDate() - daysOld)
  const dateString = date.toISOString().split('T')[0].replace(/-/g, '/')
  
  return listMessages(userId, `before:${dateString}`)
}
