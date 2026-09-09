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

    const guestStatus = comparecera ? 'confirmed' : 'declined'

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

    if (companions && companions.length > 0) {
      const companionRecords = companions.map((comp: any) => ({
        rsvp_id: rsvpData.id,
        guest_id: comp.guest_id || null,
        nome: comp.nome || '',
        status: comp.status || 'pending'
      }))

      const { error: compError } = await supabase
        .from('companion_attendance')
        .insert(companionRecords)

      if (compError) throw compError

      for (const comp of companions) {
        if (comp.guest_id && comp.status) {
          await supabase
            .from('guests')
            .update({
              status: comp.status,
              atualizado_em: new Date().toISOString()
            })
            .eq('id', comp.guest_id)
        }
      }
    }

    let updatedGuest = null
    if (guest_id) {
      const { data, error: guestUpdateError } = await supabase
        .from('guests')
        .update({
          status: guestStatus,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', guest_id)
        .select()
        .single()

      if (guestUpdateError) {
        console.warn('Could not update main guest status:', guestUpdateError)
      } else {
        updatedGuest = data
      }
    }

    return NextResponse.json(
      { success: true, rsvp: rsvpData, guest: updatedGuest },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 })
  }
}
