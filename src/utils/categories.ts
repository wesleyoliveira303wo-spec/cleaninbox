import type { ParsedEmail } from '@/lib/types'

/**
 * Categorias de e-mail
 */
export const EMAIL_CATEGORIES = {
  IMPORTANT: 'Importante',
  PROMOTION: 'Promoção',
  JUNK: 'Lixo'
} as const

export type EmailCategory = typeof EMAIL_CATEGORIES[keyof typeof EMAIL_CATEGORIES]

/**
 * Palavras-chave para identificação de promoções
 */
const PROMOTION_KEYWORDS = [
  'oferta', 'desconto', 'promoção', 'cupom', 'frete grátis',
  'black friday', 'cyber monday', 'liquidação', 'sale',
  'newsletter', 'novidades', 'lançamento', 'compre agora',
  'aproveite', 'imperdível', 'últimas unidades'
]

/**
 * Palavras-chave para identificação de spam/lixo
 */
const JUNK_KEYWORDS = [
  'ganhe dinheiro', 'clique aqui', 'parabéns você ganhou',
  'prêmio', 'urgente', 'ação necessária', 'confirme sua conta',
  'atualize seus dados', 'suspenso', 'bloqueado', 'verificação necessária',
  'phishing', 'scam', 'viagra', 'casino', 'loteria'
]

/**
 * Domínios confiáveis (bancos, serviços essenciais)
 */
const TRUSTED_DOMAINS = [
  'gov.br', 'bb.com.br', 'itau.com.br', 'bradesco.com.br',
  'caixa.gov.br', 'santander.com.br', 'nubank.com.br',
  'google.com', 'microsoft.com', 'apple.com', 'amazon.com'
]

/**
 * Verifica se um e-mail contém palavras-chave de promoção
 */
export function isPromotionEmail(email: ParsedEmail): boolean {
  const text = `${email.subject} ${email.snippet}`.toLowerCase()
  return PROMOTION_KEYWORDS.some(keyword => text.includes(keyword))
}

/**
 * Verifica se um e-mail contém palavras-chave de spam
 */
export function isJunkEmail(email: ParsedEmail): boolean {
  const text = `${email.subject} ${email.snippet}`.toLowerCase()
  return JUNK_KEYWORDS.some(keyword => text.includes(keyword))
}

/**
 * Verifica se o remetente é de um domínio confiável
 */
export function isTrustedSender(email: ParsedEmail): boolean {
  const from = email.from.toLowerCase()
  return TRUSTED_DOMAINS.some(domain => from.includes(domain))
}

/**
 * Categoriza um e-mail baseado em regras simples
 */
export function categorizeEmail(email: ParsedEmail): EmailCategory {
  // Primeiro verifica se é lixo
  if (isJunkEmail(email)) {
    return EMAIL_CATEGORIES.JUNK
  }

  // Depois verifica se é de remetente confiável
  if (isTrustedSender(email)) {
    return EMAIL_CATEGORIES.IMPORTANT
  }

  // Por último verifica se é promoção
  if (isPromotionEmail(email)) {
    return EMAIL_CATEGORIES.PROMOTION
  }

  // Padrão: importante (para não deletar por engano)
  return EMAIL_CATEGORIES.IMPORTANT
}

/**
 * Extrai o domínio do e-mail do remetente
 */
export function extractDomain(email: string): string {
  const match = email.match(/@([^>]+)/)
  return match ? match[1].trim() : ''
}

/**
 * Verifica se um e-mail é de newsletter
 */
export function isNewsletterEmail(email: ParsedEmail): boolean {
  const text = `${email.subject} ${email.snippet}`.toLowerCase()
  const from = email.from.toLowerCase()
  
  return (
    text.includes('newsletter') ||
    text.includes('unsubscribe') ||
    text.includes('descadastrar') ||
    from.includes('noreply') ||
    from.includes('no-reply')
  )
}

/**
 * Calcula score de importância (0-100)
 */
export function calculateImportanceScore(email: ParsedEmail): number {
  let score = 50 // Score base

  // Aumenta score se for de domínio confiável
  if (isTrustedSender(email)) {
    score += 30
  }

  // Diminui score se for promoção
  if (isPromotionEmail(email)) {
    score -= 20
  }

  // Diminui muito se for lixo
  if (isJunkEmail(email)) {
    score -= 40
  }

  // Diminui se for newsletter
  if (isNewsletterEmail(email)) {
    score -= 15
  }

  // Garante que está entre 0-100
  return Math.max(0, Math.min(100, score))
}
