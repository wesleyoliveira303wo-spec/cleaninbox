import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { analyzeEmails } from '@/lib/openai'
import { getUserByEmail, saveCleanHistory } from '@/lib/supabase'
import type { ParsedEmail } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/analyze
 * Analisa e-mails usando IA (GPT-4) e salva histórico no Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API Key da OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY não configurada')
      return NextResponse.json(
        { success: false, error: 'Chave da OpenAI não configurada no servidor' },
        { status: 500 }
      )
    }

    // 2. Validar sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.warn('⚠️ Tentativa de análise sem autenticação')
      return NextResponse.json(
        { success: false, error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    console.log(`📧 Usuário autenticado: ${session.user.email}`)

    // 3. Buscar usuário no banco de dados
    const dbUser = await getUserByEmail(session.user.email)
    if (!dbUser) {
      console.error(`❌ Usuário não encontrado no banco: ${session.user.email}`)
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado no sistema' },
        { status: 404 }
      )
    }

    // 4. Validar corpo da requisição
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da requisição:', parseError)
      return NextResponse.json(
        { success: false, error: 'JSON inválido na requisição' },
        { status: 400 }
      )
    }

    const { emails } = body

    // 5. Validar lista de e-mails
    if (!emails || !Array.isArray(emails)) {
      console.error('❌ Campo "emails" ausente ou inválido')
      return NextResponse.json(
        { success: false, error: 'O campo "emails" é obrigatório e deve ser um array' },
        { status: 400 }
      )
    }

    if (emails.length === 0) {
      console.warn('⚠️ Array de e-mails vazio')
      return NextResponse.json(
        { success: false, error: 'A lista de e-mails está vazia' },
        { status: 400 }
      )
    }

    console.log(`📊 Analisando ${emails.length} e-mails para ${session.user.email}`)

    // 6. Analisar e-mails com GPT-4
    let result
    try {
      result = await analyzeEmails(emails as ParsedEmail[])
      console.log(`✅ Análise concluída: ${result.classifications.length} e-mails classificados`)
    } catch (aiError: any) {
      console.error('❌ Erro na análise com IA:', aiError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao analisar e-mails com IA',
          details: aiError.message 
        },
        { status: 500 }
      )
    }

    // 7. Salvar histórico no Supabase
    try {
      const historyData = {
        user_id: dbUser.id,
        summary: {
          important: result.summary.important,
          promotion: result.summary.promotion,
          junk: result.summary.junk,
          deleted: 0,
          archived: 0
        },
        classifications: result.classifications
      }

      await saveCleanHistory(historyData)
      console.log('✅ Histórico salvo no Supabase')
    } catch (dbError) {
      console.error('❌ Erro ao salvar histórico no Supabase:', dbError)
      // Continuar mesmo se falhar ao salvar histórico (não é crítico)
    }

    // 8. Retornar resultado
    return NextResponse.json({
      success: true,
      data: {
        classifications: result.classifications,
        summary: result.summary,
        total: result.classifications.length,
        analyzed_at: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Erro geral ao processar análise:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno ao processar análise',
        message: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
