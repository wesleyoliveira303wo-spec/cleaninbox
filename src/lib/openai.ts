import OpenAI from 'openai'
import type { EmailMessage, EmailClassification, AnalysisResult } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Analisar e-mails com GPT-4
export async function analyzeEmails(emails: EmailMessage[]): Promise<AnalysisResult> {
  if (!emails || emails.length === 0) {
    return {
      classifications: [],
      summary: { important: 0, promotion: 0, junk: 0 }
    }
  }

  // Preparar dados para análise (apenas subject e snippet para economizar tokens)
  const emailsForAnalysis = emails.map((email, index) => ({
    index: index + 1,
    from: email.from,
    subject: email.subject,
    snippet: email.snippet.substring(0, 200) // Limitar snippet
  }))

  const prompt = `Você é um assistente especializado em classificar e-mails brasileiros.

Analise os seguintes e-mails e classifique cada um em uma das categorias:
- "Importante": E-mails de trabalho, bancos, serviços essenciais, documentos, confirmações importantes
- "Promoção": E-mails de marketing, ofertas, newsletters comerciais, cupons de desconto
- "Lixo": Spam, e-mails suspeitos, newsletters não solicitadas, lixo digital

E-mails para análise:
${JSON.stringify(emailsForAnalysis, null, 2)}

IMPORTANTE:
- Considere domínios brasileiros (.com.br, .br)
- Seja rigoroso com spam e promoções
- Priorize segurança: em caso de dúvida, classifique como "Lixo"

Retorne APENAS um JSON válido no seguinte formato:
{
  "classifications": [
    {
      "index": 1,
      "category": "Importante" | "Promoção" | "Lixo",
      "reason": "Breve explicação em português"
    }
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em classificação de e-mails brasileiros. Sempre retorne JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const result = completion.choices[0].message.content
    if (!result) {
      throw new Error('Resposta vazia da OpenAI')
    }

    const parsed = JSON.parse(result)
    const classifications: EmailClassification[] = parsed.classifications || []

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
    console.error('Erro ao analisar e-mails com OpenAI:', error)
    throw new Error('Falha ao analisar e-mails com IA')
  }
}

// Analisar um único e-mail
export async function analyzeSingleEmail(email: EmailMessage): Promise<EmailClassification> {
  const result = await analyzeEmails([email])
  return result.classifications[0]
}

// Classificar em lote com limite de tokens
export async function analyzeBatch(emails: EmailMessage[], batchSize = 20): Promise<AnalysisResult> {
  const batches: EmailMessage[][] = []
  
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize))
  }

  const results = await Promise.all(
    batches.map(batch => analyzeEmails(batch))
  )

  // Combinar resultados
  const allClassifications = results.flatMap(r => r.classifications)
  const summary = {
    important: allClassifications.filter(c => c.category === 'Importante').length,
    promotion: allClassifications.filter(c => c.category === 'Promoção').length,
    junk: allClassifications.filter(c => c.category === 'Lixo').length
  }

  return {
    classifications: allClassifications,
    summary
  }
}
