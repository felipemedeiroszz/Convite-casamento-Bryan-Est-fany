import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { guest_id, nome, comparecera, acompanhantes, mensagem, companions } = body

    // Create RSVP record
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvps')
      .insert({
        guest_id,
        nome,
        comparecera,
        acompanhantes,
        mensagem
      })
      .select()
      .single()

    if (rsvpError) throw rsvpError

    // Create companion attendance records
    if (companions && companions.length > 0) {
      const companionRecords = companions.map((comp: any) => ({
        rsvp_id: rsvpData.id,
        guest_id: comp.guest_id,
        nome: comp.nome,
        status: comp.status
      }))

      const { error: compError } = await supabase
        .from('companion_attendance')
        .insert(companionRecords)

      if (compError) throw compError
    }

    return NextResponse.json({ success: true, rsvp: rsvpData }, { status: 201 })
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 })
  }
}
