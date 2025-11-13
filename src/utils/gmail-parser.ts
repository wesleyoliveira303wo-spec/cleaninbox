import type { EmailMessage } from '@/lib/types'

// Extrair domínio do e-mail
export function extractDomain(email: string): string {
  const match = email.match(/@([^>]+)/)
  return match ? match[1].trim() : ''
}

// Verificar se é domínio brasileiro
export function isBrazilianDomain(email: string): boolean {
  const domain = extractDomain(email)
  return domain.endsWith('.br') || domain.endsWith('.com.br')
}

// Extrair nome do remetente
export function extractSenderName(from: string): string {
  const match = from.match(/^([^<]+)/)
  return match ? match[1].trim().replace(/"/g, '') : from
}

// Extrair e-mail do remetente
export function extractSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return match ? match[1].trim() : from
}

// Verificar se é e-mail promocional (baseado em palavras-chave)
export function isPromotionalEmail(email: EmailMessage): boolean {
  const promotionalKeywords = [
    'oferta', 'desconto', 'promoção', 'cupom', 'frete grátis',
    'black friday', 'cyber monday', 'liquidação', 'sale',
    'newsletter', 'novidades', 'lançamento', 'imperdível',
    'últimas unidades', 'aproveite', 'compre agora'
  ]

  const subject = email.subject.toLowerCase()
  const snippet = email.snippet.toLowerCase()
  const from = email.from.toLowerCase()

  // Verificar palavras-chave
  const hasKeyword = promotionalKeywords.some(keyword => 
    subject.includes(keyword) || snippet.includes(keyword)
  )

  // Verificar domínios comuns de marketing
  const marketingDomains = [
    'newsletter', 'marketing', 'promo', 'ofertas', 'news',
    'noreply', 'no-reply', 'mkt', 'comunicacao'
  ]
  const hasMarketingDomain = marketingDomains.some(domain => from.includes(domain))

  return hasKeyword || hasMarketingDomain
}

// Verificar se é spam/lixo (baseado em padrões)
export function isJunkEmail(email: EmailMessage): boolean {
  const junkKeywords = [
    'ganhe dinheiro', 'clique aqui', 'parabéns você ganhou',
    'prêmio', 'sorteio', 'viagra', 'casino', 'loteria',
    'herança', 'urgente', 'confirme seus dados', 'atualize sua conta',
    'verificação necessária', 'sua conta será suspensa'
  ]

  const subject = email.subject.toLowerCase()
  const snippet = email.snippet.toLowerCase()
  const from = email.from.toLowerCase()

  // Verificar palavras-chave de spam
  const hasJunkKeyword = junkKeywords.some(keyword => 
    subject.includes(keyword) || snippet.includes(keyword)
  )

  // Verificar remetentes suspeitos
  const suspiciousDomains = [
    'noreply@spam', 'no-reply@spam', 'info@spam',
    '@temporary', '@temp', '@disposable'
  ]
  const hasSuspiciousDomain = suspiciousDomains.some(domain => from.includes(domain))

  // Verificar excesso de maiúsculas (spam comum)
  const upperCaseRatio = (subject.match(/[A-Z]/g) || []).length / subject.length
  const hasExcessiveUpperCase = upperCaseRatio > 0.5 && subject.length > 10

  return hasJunkKeyword || hasSuspiciousDomain || hasExcessiveUpperCase
}

// Verificar se é e-mail importante
export function isImportantEmail(email: EmailMessage): boolean {
  const importantKeywords = [
    'fatura', 'boleto', 'cobrança', 'pagamento', 'invoice',
    'reunião', 'meeting', 'entrevista', 'contrato', 'proposta',
    'documento', 'confirmação', 'pedido', 'compra realizada',
    'senha', 'segurança', 'verificação', 'autenticação',
    'banco', 'cartão', 'conta', 'extrato'
  ]

  const importantDomains = [
    'gov.br', 'receita.fazenda.gov.br', 'inss.gov.br',
    'itau.com.br', 'bradesco.com.br', 'santander.com.br',
    'bb.com.br', 'caixa.gov.br', 'nubank.com.br',
    'mercadopago.com', 'paypal.com', 'pagseguro.uol.com.br'
  ]

  const subject = email.subject.toLowerCase()
  const snippet = email.snippet.toLowerCase()
  const domain = extractDomain(email.from).toLowerCase()

  // Verificar palavras-chave importantes
  const hasImportantKeyword = importantKeywords.some(keyword => 
    subject.includes(keyword) || snippet.includes(keyword)
  )

  // Verificar domínios importantes
  const hasImportantDomain = importantDomains.some(importantDomain => 
    domain.includes(importantDomain)
  )

  return hasImportantKeyword || hasImportantDomain
}

// Classificar e-mail localmente (fallback se IA falhar)
export function classifyEmailLocally(email: EmailMessage): 'Importante' | 'Promoção' | 'Lixo' {
  // Prioridade: Lixo > Importante > Promoção
  if (isJunkEmail(email)) {
    return 'Lixo'
  }
  
  if (isImportantEmail(email)) {
    return 'Importante'
  }
  
  if (isPromotionalEmail(email)) {
    return 'Promoção'
  }

  // Padrão: considerar importante se não se encaixar em nenhuma categoria
  return 'Importante'
}

// Formatar data para exibição
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
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  } catch {
    return dateString
  }
}

// Truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
