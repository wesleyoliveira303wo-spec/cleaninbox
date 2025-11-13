import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { listMessages, searchByCategory, searchOldEmails } from '@/lib/gmail'
import { getUserByEmail } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const category = searchParams.get('category') as 'promotions' | 'social' | 'updates' | null
    const daysOld = searchParams.get('daysOld')
    const maxResults = parseInt(searchParams.get('maxResults') || '100')

    let messages

    if (category) {
      messages = await searchByCategory(dbUser.id, category)
    } else if (daysOld) {
      messages = await searchOldEmails(dbUser.id, parseInt(daysOld))
    } else {
      messages = await listMessages(dbUser.id, query || undefined, maxResults)
    }

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length
    })
  } catch (error) {
    console.error('Erro ao listar e-mails:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar e-mails' },
      { status: 500 }
    )
  }
}
