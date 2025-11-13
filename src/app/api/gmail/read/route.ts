import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { readMessage } from '@/lib/gmail'
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
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'messageId é obrigatório' },
        { status: 400 }
      )
    }

    const message = await readMessage(dbUser.id, messageId)

    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Erro ao ler e-mail:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao ler e-mail' },
      { status: 500 }
    )
  }
}
