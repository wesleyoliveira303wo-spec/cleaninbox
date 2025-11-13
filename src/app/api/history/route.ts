import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Função para criar cliente Supabase sob demanda
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { success: true, history: [] },
        { status: 200 }
      )
    }

    const { data, error } = await supabase
      .from('clean_history')
      .select('*')
      .eq('user_email', session.user.email)
      .order('analysis_date', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Erro ao buscar histórico:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar histórico' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      history: data || [],
    })

  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar histórico' },
      { status: 500 }
    )
  }
}
