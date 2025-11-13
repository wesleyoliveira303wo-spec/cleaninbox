import OpenAI from 'openai'
import type { ParsedEmail, EmailClassification, AnalysisResult } from './types'

// Validar API Key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY não configurada')
}

// Cliente OpenAI com nova API
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Classifica e-mails usando GPT-4.1-mini com nova API /v1/responses
 */
export async function classifyEmails(emails: ParsedEmail[]): Promise<AnalysisResult> {
  if (!emails || emails.length === 0) {
    return {
      classifications: [],
      summary: {
        important: 0,
        promotion: 0,
        junk: 0
      }
    }
  }

  // Preparar dados dos e-mails para análise
  const emailsFormatted = emails.map((email, index) => ({
    index: index + 1,
    id: email.id,
    from: email.from,
    subject: email.subject,
    snippet: email.snippet
  }))

  const prompt = `Você é um assistente especializado em classificar e-mails em português brasileiro.

Classifique cada e-mail em uma das seguintes categorias:
- "Importante": E-mails de trabalho, bancos, serviços essenciais, confirmações importantes, documentos oficiais
- "Promoção": E-mails de marketing, ofertas, newsletters comerciais, cupons, propagandas
- "Lixo": Spam, phishing, e-mails suspeitos, correntes, conteúdo irrelevante ou malicioso

Para cada e-mail, forneça:
1. O índice do e-mail (campo "index")
2. A categoria exata ("Importante", "Promoção" ou "Lixo")
3. Uma breve razão (máximo 50 caracteres)

E-mails para classificar:
${JSON.stringify(emailsFormatted, null, 2)}

Retorne APENAS um JSON válido no seguinte formato (sem texto adicional):
{
  "classifications": [
    {
      "index": 1,
      "category": "Importante",
      "reason": "Fatura bancária"
    }
  ]
}`

  try {
    console.log(`🤖 Analisando ${emails.length} e-mails com GPT-4.1-mini (nova API)...`)

    // Usar nova API /v1/responses
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      response_format: { type: 'json_object' }
    })

    // Extrair texto da resposta (novo formato)
    let responseText: string | null = null
    
    // Tentar extrair de diferentes formatos possíveis
    if (response.output && Array.isArray(response.output) && response.output[0]) {
      // Formato: response.output[0].content[0].text
      if (response.output[0].content && Array.isArray(response.output[0].content)) {
        responseText = response.output[0].content[0]?.text
      }
    } else if (response.output_text) {
      // Formato alternativo: response.output_text
      responseText = response.output_text
    }

    if (!responseText) {
      console.error('❌ Resposta vazia da OpenAI (nova API)')
      console.error('Estrutura da resposta:', JSON.stringify(response, null, 2))
      throw new Error('Resposta vazia da IA')
    }

    console.log('✅ Resposta recebida da OpenAI (nova API)')

    // Parse do JSON
    let parsed: any
    try {
      parsed = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError)
      console.error('Resposta recebida:', responseText)
      throw new Error('JSON inválido retornado pela IA')
    }

    // Validar estrutura da resposta
    if (!parsed.classifications || !Array.isArray(parsed.classifications)) {
      console.error('❌ Formato de resposta inválido:', parsed)
      throw new Error('Formato de resposta inválido da IA')
    }
    
    // Mapear índices de volta para os IDs reais dos e-mails
    const classifications: EmailClassification[] = parsed.classifications.map((c: any) => {
      const emailIndex = parseInt(c.index) - 1
      const email = emails[emailIndex]
      
      if (!email) {
        console.warn(`⚠️ E-mail não encontrado para índice ${c.index}`)
      }

      return {
        id: email?.id || c.index.toString(),
        category: c.category,
        reason: c.reason || 'Sem motivo',
        confidence: c.confidence || 0.9
      }
    })

    // Calcular resumo
    const summary = {
      important: classifications.filter(c => c.category === 'Importante').length,
      promotion: classifications.filter(c => c.category === 'Promoção').length,
      junk: classifications.filter(c => c.category === 'Lixo').length
    }

    console.log(`✅ Classificação concluída: ${summary.important} importantes, ${summary.promotion} promoções, ${summary.junk} lixo`)

    return {
      classifications,
      summary
    }
  } catch (error: any) {
    console.error('❌ Erro ao classificar e-mails com OpenAI:', error)
    
    // Log detalhado do erro
    if (error.response) {
      console.error('Resposta de erro da API:', {
        status: error.response.status,
        data: error.response.data
      })
    }
    
    // Log da mensagem de erro específica
    if (error.message) {
      console.error('Mensagem de erro:', error.message)
    }
    
    if (error.message?.includes('API key')) {
      throw new Error('Chave da OpenAI inválida ou não configurada')
    }
    
    throw new Error(`Erro ao chamar OpenAI API: ${error.message || 'Erro desconhecido'}`)
  }
}

/**
 * Alias para manter compatibilidade com código existente
 */
export async function analyzeEmails(emails: ParsedEmail[]): Promise<AnalysisResult> {
  return classifyEmails(emails)
}

/**
 * Classifica um único e-mail
 */
export async function classifySingleEmail(email: ParsedEmail): Promise<EmailClassification> {
  const result = await classifyEmails([email])
  return result.classifications[0]
}

/**
 * Gera um resumo textual da análise
 */
export function generateSummaryText(result: AnalysisResult): string {
  const total = result.classifications.length
  const { important, promotion, junk } = result.summary

  return `Analisados ${total} e-mails: ${important} importantes, ${promotion} promoções, ${junk} lixo.`
}

/**
 * Obtém recomendações de limpeza
 */
export function getCleaningRecommendations(result: AnalysisResult) {
  const recommendations = []

  if (result.summary.junk > 0) {
    recommendations.push({
      action: 'delete',
      count: result.summary.junk,
      message: `Deletar ${result.summary.junk} e-mail(s) classificado(s) como lixo`
    })
  }

  if (result.summary.promotion > 0) {
    recommendations.push({
      action: 'archive',
      count: result.summary.promotion,
      message: `Arquivar ${result.summary.promotion} e-mail(s) de promoção`
    })
  }

  if (result.summary.important > 0) {
    recommendations.push({
      action: 'keep',
      count: result.summary.important,
      message: `Manter ${result.summary.important} e-mail(s) importante(s)`
    })
  }

  return recommendations
}
