// Categorias de e-mails

export const EMAIL_CATEGORIES = {
  IMPORTANT: 'Importante',
  PROMOTION: 'Promoção',
  JUNK: 'Lixo'
} as const

export type EmailCategory = typeof EMAIL_CATEGORIES[keyof typeof EMAIL_CATEGORIES]

// Palavras-chave por categoria
export const CATEGORY_KEYWORDS = {
  important: [
    // Financeiro
    'fatura', 'boleto', 'cobrança', 'pagamento', 'invoice', 'nota fiscal',
    'extrato', 'saldo', 'débito', 'crédito', 'transferência',
    
    // Trabalho
    'reunião', 'meeting', 'entrevista', 'contrato', 'proposta',
    'projeto', 'deadline', 'prazo', 'urgente', 'importante',
    
    // Documentos
    'documento', 'certificado', 'comprovante', 'recibo', 'declaração',
    
    // Segurança
    'senha', 'segurança', 'verificação', 'autenticação', 'código',
    'confirmação', 'ativação', 'recuperação',
    
    // Serviços essenciais
    'pedido', 'compra realizada', 'envio', 'entrega', 'rastreamento'
  ],
  
  promotion: [
    // Ofertas
    'oferta', 'desconto', 'promoção', 'cupom', 'voucher',
    'frete grátis', 'cashback', 'pontos', 'recompensa',
    
    // Eventos comerciais
    'black friday', 'cyber monday', 'liquidação', 'sale', 'queima',
    'outlet', 'bazar', 'feira',
    
    // Marketing
    'newsletter', 'novidades', 'lançamento', 'imperdível',
    'últimas unidades', 'estoque limitado', 'aproveite',
    'compre agora', 'não perca', 'exclusivo',
    
    // Categorias de produtos
    'moda', 'eletrônicos', 'beleza', 'casa', 'decoração',
    'livros', 'games', 'viagem', 'turismo'
  ],
  
  junk: [
    // Spam clássico
    'ganhe dinheiro', 'renda extra', 'trabalhe em casa',
    'clique aqui', 'parabéns você ganhou', 'prêmio',
    'sorteio', 'loteria', 'herança', 'milhões',
    
    // Phishing
    'confirme seus dados', 'atualize sua conta', 'verifique sua identidade',
    'sua conta será suspensa', 'bloqueio de conta', 'ação necessária',
    'clique imediatamente', 'urgente: verifique',
    
    // Produtos suspeitos
    'viagra', 'cialis', 'remédio', 'medicamento barato',
    'casino', 'apostas', 'poker', 'slots',
    
    // Outros
    'corrente', 'repasse', 'compartilhe', 'encaminhe'
  ]
}

// Domínios importantes (bancos, governo, serviços essenciais)
export const IMPORTANT_DOMAINS = [
  // Governo
  'gov.br', 'receita.fazenda.gov.br', 'inss.gov.br', 'detran',
  'tse.jus.br', 'trf', 'tjsp.jus.br',
  
  // Bancos
  'itau.com.br', 'bradesco.com.br', 'santander.com.br',
  'bb.com.br', 'caixa.gov.br', 'nubank.com.br', 'inter.co',
  'original.com.br', 'safra.com.br', 'banrisul.com.br',
  
  // Pagamentos
  'mercadopago.com', 'paypal.com', 'pagseguro.uol.com.br',
  'picpay.com', 'stone.com.br', 'cielo.com.br',
  
  // Utilities
  'cpfl.com.br', 'enel.com.br', 'sabesp.com.br',
  'vivo.com.br', 'claro.com.br', 'tim.com.br', 'oi.com.br',
  
  // E-commerce confiável
  'amazon.com.br', 'mercadolivre.com.br', 'americanas.com.br',
  'magazineluiza.com.br', 'casasbahia.com.br'
]

// Domínios de marketing conhecidos
export const MARKETING_DOMAINS = [
  'newsletter', 'marketing', 'promo', 'ofertas', 'news',
  'noreply', 'no-reply', 'mkt', 'comunicacao', 'contato',
  'info', 'mail', 'email', 'sender', 'mailer'
]

// Domínios suspeitos/spam
export const SUSPICIOUS_DOMAINS = [
  'spam', 'temporary', 'temp', 'disposable', 'fake',
  'test', 'example', 'invalid', 'bounce', 'mailer-daemon'
]

// Ações de limpeza
export const CLEAN_ACTIONS = {
  DELETE: 'delete',
  ARCHIVE: 'archive',
  MARK_READ: 'mark_read',
  KEEP: 'keep'
} as const

export type CleanAction = typeof CLEAN_ACTIONS[keyof typeof CLEAN_ACTIONS]

// Regras de limpeza automática
export const AUTO_CLEAN_RULES = {
  // Deletar lixo automaticamente
  deleteJunk: true,
  
  // Arquivar promoções antigas (mais de 30 dias)
  archiveOldPromotions: true,
  archivePromotionsDays: 30,
  
  // Manter importantes sempre
  keepImportant: true,
  
  // Marcar promoções como lidas
  markPromotionsAsRead: false,
  
  // Limite de e-mails por execução
  maxEmailsPerRun: 100
}

// Configurações de análise
export const ANALYSIS_CONFIG = {
  // Modelo OpenAI
  model: 'gpt-4o-mini',
  
  // Temperatura (0 = determinístico, 1 = criativo)
  temperature: 0.3,
  
  // Tamanho do batch
  batchSize: 20,
  
  // Limite de snippet
  snippetMaxLength: 200,
  
  // Timeout (ms)
  timeout: 30000
}
