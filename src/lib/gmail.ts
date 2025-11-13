import { google } from 'googleapis'
import type { GmailMessage, ParsedEmail, GmailListResponse } from './types'
import { getUserToken, saveUserToken } from './supabase'

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://mail.google.com/'
]

/**
 * Cria um cliente OAuth2 do Google
 */
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  )
}

/**
 * Obtém um cliente Gmail autenticado para o usuário
 */
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
    oauth2Client.setCredentials({
      refresh_token: tokenData.refresh_token
    })

    const { credentials } = await oauth2Client.refreshAccessToken()
    
    // Salvar novo token
    await saveUserToken({
      user_id: userId,
      access_token: credentials.access_token!,
      refresh_token: credentials.refresh_token || tokenData.refresh_token,
      expires_at: credentials.expiry_date || Date.now() + 3600000,
      updated_at: new Date().toISOString()
    })

    oauth2Client.setCredentials(credentials)
  } else {
    // Token ainda válido
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token
    })
  }

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

/**
 * Lista mensagens do Gmail
 */
export async function listMessages(
  userId: string,
  query?: string,
  maxResults = 50
): Promise<GmailListResponse> {
  const gmail = await getGmailClient(userId)
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults
  })

  return response.data as GmailListResponse
}

/**
 * Obtém detalhes de uma mensagem específica
 */
export async function getMessage(
  userId: string,
  messageId: string
): Promise<GmailMessage> {
  const gmail = await getGmailClient(userId)
  
  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  })

  return response.data as GmailMessage
}

/**
 * Deleta uma mensagem (move para lixeira)
 */
export async function deleteMessage(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId)
  
  await gmail.users.messages.trash({
    userId: 'me',
    id: messageId
  })

  return { success: true, messageId }
}

/**
 * Arquiva uma mensagem (remove da inbox)
 */
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

/**
 * Marca mensagem como lida
 */
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

/**
 * Obtém estatísticas das categorias do Gmail
 */
export async function getGmailStats(userId: string) {
  const gmail = await getGmailClient(userId)
  
  const [inbox, spam, trash, important] = await Promise.all([
    gmail.users.messages.list({ userId: 'me', labelIds: ['INBOX'] }),
    gmail.users.messages.list({ userId: 'me', labelIds: ['SPAM'] }),
    gmail.users.messages.list({ userId: 'me', labelIds: ['TRASH'] }),
    gmail.users.messages.list({ userId: 'me', labelIds: ['IMPORTANT'] })
  ])

  return {
    inbox: inbox.data.resultSizeEstimate || 0,
    spam: spam.data.resultSizeEstimate || 0,
    trash: trash.data.resultSizeEstimate || 0,
    important: important.data.resultSizeEstimate || 0
  }
}

/**
 * Parse de mensagem do Gmail para formato simplificado
 */
export function parseGmailMessage(message: GmailMessage): ParsedEmail {
  const headers = message.payload?.headers || []
  
  const getHeader = (name: string) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase())
    return header?.value || ''
  }

  const from = getHeader('From')
  const subject = getHeader('Subject')
  const date = getHeader('Date') || message.internalDate || new Date().toISOString()

  // Extrair corpo do e-mail
  let body = ''
  if (message.payload?.body?.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8')
  } else if (message.payload?.parts) {
    const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain')
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
    }
  }

  return {
    id: message.id,
    from,
    subject,
    snippet: message.snippet,
    date,
    body: body || message.snippet
  }
}

/**
 * Busca e-mails de promoções
 */
export async function getPromotionEmails(userId: string, maxResults = 50) {
  return listMessages(userId, 'category:promotions', maxResults)
}

/**
 * Busca e-mails de spam
 */
export async function getSpamEmails(userId: string, maxResults = 50) {
  return listMessages(userId, 'in:spam', maxResults)
}

/**
 * Busca e-mails importantes
 */
export async function getImportantEmails(userId: string, maxResults = 50) {
  return listMessages(userId, 'is:important', maxResults)
}
