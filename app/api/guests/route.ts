import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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
  // Return empty array if Supabase is not configured
  if (!isSupabaseConfigured) {
    return NextResponse.json([])
  }

  try {
    const { data, error } = await supabase!
      .from('guests')
      .select('*')
      .order('nome_completo')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching guests:', error)
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
    const { nome_completo, email, telefone, whatsapp } = body

    const { data, error } = await supabase!
      .from('guests')
      .insert({
        nome_completo,
        email,
        telefone,
        whatsapp,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })
  }
}
