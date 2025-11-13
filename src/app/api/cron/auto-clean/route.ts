import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/supabase'
import { listMessages } from '@/lib/gmail'
import { analyzeEmails } from '@/lib/openai'
import { deleteMessage, archiveMessage } from '@/lib/gmail'
import { saveCleanHistory } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Verificar autorização (apenas cron jobs da Vercel)
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'dev-secret'
  
  // Em desenvolvimento, permitir sem auth
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autorização
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    console.log('🧹 Iniciando limpeza automática...')

    // Buscar todos os usuários
    const users = await getAllUsers()
    console.log(`📊 Encontrados ${users.length} usuários`)

    const results = []

    for (const user of users) {
      try {
        console.log(`🔍 Processando usuário: ${user.email}`)

        // Buscar e-mails dos últimos 7 dias
        const emails = await listMessages(user.id, 'newer_than:7d', 100)
        console.log(`📧 Encontrados ${emails.length} e-mails`)

        if (emails.length === 0) {
          results.push({
            userId: user.id,
            email: user.email,
            status: 'no_emails',
            processed: 0
          })
          continue
        }

        // Analisar com GPT-4
        const analysis = await analyzeEmails(emails)
        console.log(`🤖 Análise concluída: ${JSON.stringify(analysis.summary)}`)

        // Deletar lixo
        const junkEmails = analysis.classifications
          .filter(c => c.category === 'Lixo')
          .map(c => emails[c.index - 1])

        let deletedCount = 0
        for (const email of junkEmails) {
          try {
            await deleteMessage(user.id, email.id)
            deletedCount++
          } catch (error) {
            console.error(`Erro ao deletar ${email.id}:`, error)
          }
        }

        // Arquivar promoções antigas (mais de 30 dias)
        const promotionEmails = analysis.classifications
          .filter(c => c.category === 'Promoção')
          .map(c => emails[c.index - 1])
          .filter(email => {
            const emailDate = new Date(email.date)
            const daysOld = (Date.now() - emailDate.getTime()) / (1000 * 60 * 60 * 24)
            return daysOld > 30
          })

        let archivedCount = 0
        for (const email of promotionEmails) {
          try {
            await archiveMessage(user.id, email.id)
            archivedCount++
          } catch (error) {
            console.error(`Erro ao arquivar ${email.id}:`, error)
          }
        }

        // Salvar histórico
        await saveCleanHistory({
          user_id: user.id,
          summary: {
            ...analysis.summary,
            deleted: deletedCount,
            archived: archivedCount
          },
          classifications: analysis.classifications
        })

        results.push({
          userId: user.id,
          email: user.email,
          status: 'success',
          processed: emails.length,
          deleted: deletedCount,
          archived: archivedCount,
          summary: analysis.summary
        })

        console.log(`✅ Usuário ${user.email} processado: ${deletedCount} deletados, ${archivedCount} arquivados`)
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${user.email}:`, error)
        results.push({
          userId: user.id,
          email: user.email,
          status: 'error',
          error: String(error)
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    console.log(`🎉 Limpeza concluída: ${successCount} sucessos, ${errorCount} erros`)

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: users.length,
        processed: successCount,
        errors: errorCount,
        results
      }
    })
  } catch (error) {
    console.error('❌ Erro na limpeza automática:', error)
    return NextResponse.json(
      { success: false, error: 'Erro na limpeza automática' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
