import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { deleteMessage, archiveMessage, markAsRead } from '@/lib/gmail'
import { getUserByEmail } from '@/lib/supabase'

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
    const { action, messageId, messageIds } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action é obrigatório' },
        { status: 400 }
      )
    }

    // Suportar ação em múltiplos e-mails
    const ids = messageIds || [messageId]
    
    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'messageId ou messageIds é obrigatório' },
        { status: 400 }
      )
    }

    const results = []

    for (const id of ids) {
      try {
        let result
        
        switch (action) {
          case 'delete':
            result = await deleteMessage(dbUser.id, id)
            break
          case 'archive':
            result = await archiveMessage(dbUser.id, id)
            break
          case 'markAsRead':
            result = await markAsRead(dbUser.id, id)
            break
          default:
            return NextResponse.json(
              { success: false, error: `Ação inválida: ${action}` },
              { status: 400 }
            )
        }
        
        results.push({ messageId: id, ...result })
      } catch (error) {
        console.error(`Erro ao processar ${id}:`, error)
        results.push({ messageId: id, success: false, error: String(error) })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    return NextResponse.json({
      success: failCount === 0,
      data: {
        total: results.length,
        success: successCount,
        failed: failCount,
        results
      }
    })
  } catch (error) {
    console.error('Erro ao modificar e-mails:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao modificar e-mails' },
      { status: 500 }
    )
  }
}
