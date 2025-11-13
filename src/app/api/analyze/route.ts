import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

interface EmailData {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
}

// Função para criar cliente Supabase sob demanda
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { emails } = body as { emails: EmailData[] }

    if (!emails || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum e-mail fornecido' },
        { status: 400 }
      )
    }

    // Preparar prompt para GPT-4
    const emailList = emails.map((email, index) => 
      `${index + 1}. De: ${email.from}\n   Assunto: ${email.subject}\n   Prévia: ${email.snippet}`
    ).join('\n\n')

    const prompt = `Você é um assistente de IA especializado em classificar e-mails brasileiros. Analise os seguintes e-mails e classifique cada um em uma das categorias:
- "Importante": E-mails de trabalho, bancos, documentos, contatos pessoais importantes
- "Promoção": E-mails de lojas, ofertas, marketing, cupons
- "Lixo": Spam, newsletters não solicitadas, notificações automáticas irrelevantes

E-mails para classificar:

${emailList}

Responda APENAS com um JSON válido no formato:
{
  "classifications": [
    { "index": 1, "category": "Importante", "reason": "motivo breve" },
    { "index": 2, "category": "Promoção", "reason": "motivo breve" }
  ],
  "summary": {
    "important": número,
    "promotion": número,
    "junk": número
  }
}`

    // Chamar OpenAI GPT-4
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API não configurada' },
        { status: 500 }
      )
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em classificar e-mails em português brasileiro. Sempre responda com JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error('Erro ao chamar OpenAI API')
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = JSON.parse(openaiData.choices[0].message.content)

    // Salvar resultados no Supabase (se configurado)
    let savedToDatabase = false
    const supabase = getSupabaseClient()
    
    if (supabase) {
      const cleanHistory = {
        user_email: session.user.email,
        emails_analyzed: emails.length,
        important_count: aiResponse.summary.important,
        promotion_count: aiResponse.summary.promotion,
        junk_count: aiResponse.summary.junk,
        analysis_date: new Date().toISOString(),
        classifications: aiResponse.classifications,
      }

      const { error: saveError } = await supabase
        .from('clean_history')
        .insert(cleanHistory)
        .select()

      if (saveError) {
        console.error('Erro ao salvar no Supabase:', saveError)
      } else {
        savedToDatabase = true
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        classifications: aiResponse.classifications,
        summary: aiResponse.summary,
        savedToDatabase,
      }
    })

  } catch (error) {
    console.error('Erro ao analisar e-mails:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao analisar e-mails com IA' },
      { status: 500 }
    )
  }
}
