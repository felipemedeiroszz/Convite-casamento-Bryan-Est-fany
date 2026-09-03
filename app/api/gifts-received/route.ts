import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('gifts_received')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching gifts received:', error)
    return NextResponse.json({ error: 'Failed to fetch gifts received' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, product_name, guest_name, amount, mensagem, tipo } = body

    const { data, error } = await supabase
      .from('gifts_received')
      .insert({
        product_id,
        product_name,
        guest_name,
        amount,
        date: new Date().toISOString(),
        mensagem: mensagem || null,
        tipo: tipo || 'gift'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating gift received:', error)
    return NextResponse.json({ error: 'Failed to create gift received' }, { status: 500 })
  }
}