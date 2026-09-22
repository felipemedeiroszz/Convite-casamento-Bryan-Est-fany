import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Check if Supabase is configured
const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabase = isSupabaseConfigured
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json([])
  }

  try {
    const { data, error } = await supabase!
      .from('gifts')
      .select('*')
      .order('ordem', { ascending: true })

    if (error) throw error

    // Add availability status to each gift
    const giftsWithAvailability = (data || []).map(gift => ({
      ...gift,
      disponivel: (gift.quantidade_disponivel || 9999) > 0,
      quantidade_disponivel: gift.quantidade_disponivel || 9999
    }))

    return NextResponse.json(giftsWithAvailability)
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { nome, descricao, valor, imagem_url, quantidade_disponivel } = body

    // Validate minimum value (R$ 1.00 for testing)
    if (!valor || valor < 1) {
      return NextResponse.json(
        { error: 'O valor mínimo para presente é R$ 1,00' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase!
      .from('gifts')
      .insert({
        nome,
        descricao,
        valor,
        imagem_url,
        quantidade_disponivel: quantidade_disponivel || 9999,
        ativo: true,
        ordem: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 })
  }
}
