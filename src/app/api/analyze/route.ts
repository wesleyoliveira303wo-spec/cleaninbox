import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

// FORÇA A ROTA A RODAR EM NODE (necessário para getServerSession)
export const runtime = "nodejs"

interface EmailData {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
}

export async function POST(request: NextRequest) {
  try {
    // ✔ Sessão funcionando corretamente
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { emails } = await request.json()

    if (!emails || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum e-mail fornecido" },
        { status: 400 }
      )
    }

    // Prompt p/ IA
    const emailList = emails
      .map(
        (email: EmailData, index: number) =>
          `${index + 1}. De: ${email.from}\nAssunto: ${
            email.subject
          }\nPrévia: ${email.snippet}`
      )
      .join("\n\n")

    const prompt = `
Classifique os e-mails abaixo em: Importante, Promoção ou Lixo.
Sempre responda APENAS em JSON válido.

${emailList}

Formato esperado:
{
  "classifications": [
    { "index": 1, "category": "Importante", "reason": "..." }
  ],
  "summary": {
    "important": 0,
    "promotion": 0,
    "junk": 0
  }
}
`

    // ✔ OpenAI Key
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI não configurado" },
        { status: 500 }
      )
    }

    // ✔ Chamada FORA do try do JSON.parse para evitar crash
    const rawOpenAI = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Você é um classificador de e-mails brasileiro. Responda APENAS com JSON válido.",
          },
          { role: "user", content: prompt },
        ],
      }),
    })

    if (!rawOpenAI.ok) {
      const text = await rawOpenAI.text()
      console.error("OpenAI Error:", text)
      return NextResponse.json(
        { success: false, error: "Falha ao chamar OpenAI" },
        { status: 500 }
      )
    }

    const openaiData = await rawOpenAI.json()

    // ✔ parse seguro
    let aiResponse
    try {
      aiResponse = JSON.parse(openaiData.choices[0].message.content)
    } catch (err) {
      console.error("Erro no JSON da OpenAI:", err)
      return NextResponse.json(
        { success: false, error: "Erro ao interpretar resposta da IA" },
        { status: 500 }
      )
    }

    // ✔ Supabase opcional
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_KEY! // CHAVE CORRETA
    )

    await supabase.from("clean_history").insert({
      user_email: session.user.email,
      emails_analyzed: emails.length,
      ...aiResponse.summary,
      classifications: aiResponse.classifications,
      analysis_date: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: aiResponse,
    })
  } catch (error) {
    console.error("Erro geral:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno ao analisar e-mails" },
      { status: 500 }
    )
  }
}
