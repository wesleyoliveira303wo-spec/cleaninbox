import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Verificar se Supabase está configurado
    if (!supabase) {
      console.warn('Supabase não configurado - variáveis de ambiente ausentes')
      return NextResponse.json(
        { success: false, error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, name, image, provider } = body

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Atualizar informações
      const { data, error } = await supabase
        .from('users')
        .update({
          name,
          image,
          last_login: new Date().toISOString(),
        })
        .eq('email', email)
        .select()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    // Criar novo usuário
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        image,
        provider,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      })
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar usuário' },
      { status: 500 }
    )
  }
}
