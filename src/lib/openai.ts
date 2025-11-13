import OpenAI from 'openai'
import type { ParsedEmail, EmailClassification, AnalysisResult } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Classifica e-mails usando GPT-4
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

  // Preparar prompt para a IA
  const emailsFormatted = emails.map((email, index) => ({
    index: index + 1,
    from: email.from,
    subject: email.subject,
    snippet: email.snippet
  }))

  const systemPrompt = `Você é um assistente especializado em classificar e-mails em português brasileiro.

Classifique cada e-mail em uma das seguintes categorias:
- "Importante": E-mails de trabalho, bancos, serviços essenciais, confirmações importantes
- "Promoção": E-mails de marketing, ofertas, newsletters comerciais, cupons
- "Lixo": Spam, phishing, e-mails suspeitos, correntes, conteúdo irrelevante

Para cada e-mail, forneça:
1. O ID do e-mail (índice)
2. A categoria
3. Uma breve razão (máximo 50 caracteres)

Retorne APENAS um JSON válido no seguinte formato:
{
  "classifications": [
    {
      "id": "1",
      "category": "Importante",
      "reason": "Fatura bancária"
    }
  ]
}`

  const userPrompt = `Classifique os seguintes e-mails:

${JSON.stringify(emailsFormatted, null, 2)}

Retorne APENAS o JSON com as classificações.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000
    })

    const responseText = completion.choices[0]?.message?.content
    
    if (!responseText) {
      throw new Error('Resposta vazia da IA')
    }

    const parsed = JSON.parse(responseText)
    
    // Mapear IDs de volta para os IDs reais dos e-mails
    const classifications: EmailClassification[] = parsed.classifications.map((c: any) => ({
      id: emails[parseInt(c.id) - 1]?.id || c.id,
      category: c.category,
      reason: c.reason,
      confidence: c.confidence || 0.9
    }))

    // Calcular resumo
    const summary = {
      important: classifications.filter(c => c.category === 'Importante').length,
      promotion: classifications.filter(c => c.category === 'Promoção').length,
      junk: classifications.filter(c => c.category === 'Lixo').length
    }

    return {
      classifications,
      summary
    }
  } catch (error) {
    console.error('Erro ao classificar e-mails:', error)
    throw new Error('Falha ao classificar e-mails com IA')
  }
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
