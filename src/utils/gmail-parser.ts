import type { GmailMessage, ParsedEmail } from '@/lib/types'

/**
 * Extrai o valor de um header específico
 */
export function getHeader(message: GmailMessage, headerName: string): string {
  const headers = message.payload?.headers || []
  const header = headers.find(h => h.name.toLowerCase() === headerName.toLowerCase())
  return header?.value || ''
}

/**
 * Extrai todos os headers importantes
 */
export function extractHeaders(message: GmailMessage) {
  return {
    from: getHeader(message, 'From'),
    to: getHeader(message, 'To'),
    subject: getHeader(message, 'Subject'),
    date: getHeader(message, 'Date'),
    messageId: getHeader(message, 'Message-ID'),
    replyTo: getHeader(message, 'Reply-To')
  }
}

/**
 * Extrai o corpo do e-mail (texto plano)
 */
export function extractBody(message: GmailMessage): string {
  // Tenta extrair do body direto
  if (message.payload?.body?.data) {
    return decodeBase64(message.payload.body.data)
  }

  // Tenta extrair das parts
  if (message.payload?.parts) {
    // Procura por text/plain primeiro
    const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain')
    if (textPart?.body?.data) {
      return decodeBase64(textPart.body.data)
    }

    // Se não encontrar, procura por text/html
    const htmlPart = message.payload.parts.find(part => part.mimeType === 'text/html')
    if (htmlPart?.body?.data) {
      return stripHtml(decodeBase64(htmlPart.body.data))
    }

    // Procura recursivamente em parts aninhadas
    for (const part of message.payload.parts) {
      if (part.parts) {
        const nestedTextPart = part.parts.find(p => p.mimeType === 'text/plain')
        if (nestedTextPart?.body?.data) {
          return decodeBase64(nestedTextPart.body.data)
        }
      }
    }
  }

  // Fallback para snippet
  return message.snippet || ''
}

/**
 * Decodifica string base64 do Gmail
 */
function decodeBase64(data: string): string {
  try {
    // Gmail usa base64url (substitui + por - e / por _)
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    return Buffer.from(base64, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Erro ao decodificar base64:', error)
    return ''
  }
}

/**
 * Remove tags HTML de uma string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

/**
 * Extrai o endereço de e-mail de uma string "Nome <email@domain.com>"
 */
export function extractEmailAddress(fromString: string): string {
  const match = fromString.match(/<([^>]+)>/)
  return match ? match[1] : fromString.trim()
}

/**
 * Extrai o nome do remetente
 */
export function extractSenderName(fromString: string): string {
  const match = fromString.match(/^([^<]+)</)
  return match ? match[1].trim().replace(/"/g, '') : ''
}

/**
 * Converte mensagem do Gmail para formato simplificado
 */
export function parseGmailMessage(message: GmailMessage): ParsedEmail {
  const headers = extractHeaders(message)
  const body = extractBody(message)

  return {
    id: message.id,
    from: headers.from,
    subject: headers.subject,
    snippet: message.snippet,
    date: headers.date || message.internalDate || new Date().toISOString(),
    body: body || message.snippet
  }
}

/**
 * Converte múltiplas mensagens do Gmail
 */
export function parseGmailMessages(messages: GmailMessage[]): ParsedEmail[] {
  return messages.map(parseGmailMessage)
}

/**
 * Formata data do e-mail para formato legível
 */
export function formatEmailDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Hoje'
    } else if (diffDays === 1) {
      return 'Ontem'
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  } catch (error) {
    return dateString
  }
}

/**
 * Trunca texto longo
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Valida se uma mensagem do Gmail é válida
 */
export function isValidGmailMessage(message: any): message is GmailMessage {
  return (
    message &&
    typeof message.id === 'string' &&
    typeof message.threadId === 'string' &&
    typeof message.snippet === 'string'
  )
}
