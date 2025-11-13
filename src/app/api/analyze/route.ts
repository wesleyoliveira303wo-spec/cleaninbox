import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { analyzeEmails } from '@/lib/openai'
import { getUserByEmail, saveCleanHistory } from '@/lib/supabase'
import type { EmailMessage } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const dbUser = await getUserByEmail(session.user.email)
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { emails } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'emails é obrigatório e deve ser um array não vazio' },
        { status: 400 }
      )
    }

    // Analisar e-mails com GPT-4
    const result = await analyzeEmails(emails as EmailMessage[])

    // Salvar histórico no Supabase
    try {
      await saveCleanHistory({
        user_id: dbUser.id,
        summary: {
          ...result.summary,
          deleted: 0,
          archived: 0
        },
        classifications: result.classifications
      })
    } catch (error) {
      console.error('Erro ao salvar histórico:', error)
      // Continuar mesmo se falhar ao salvar histórico
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Erro ao analisar e-mails:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao analisar e-mails com IA' },
      { status: 500 }
    )
  }
}
