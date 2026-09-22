import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })
    }

    console.log('[TEST CONFIRM] Manually confirming payment:', paymentId)

    // Connect to Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { secure: process.env.NODE_ENV === 'production' },
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // no-op
          },
        },
      },
    )

    // Get payment from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      console.error('[TEST CONFIRM] Payment not found:', paymentId, paymentError)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('[TEST CONFIRM] Current payment status:', payment.status)

    // Update payment status to CONFIRMED
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'CONFIRMED',
        atualizado_em: new Date().toISOString(),
        webhook_data: { manual: true, event: 'MANUAL_CONFIRM' },
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (updateError) {
      console.error('[TEST CONFIRM] Error updating payment:', updateError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('[TEST CONFIRM] Payment updated successfully')

    // If payment is linked to a gift, mark it as received
    if (updatedPayment) {
      // Check if there's a gift contribution
      const { data: contribution } = await supabase
        .from('gift_contributions')
        .select('*, gifts(*)')
        .eq('payment_id', paymentId)
        .single()

      if (contribution && contribution.gifts) {
        console.log('[TEST CONFIRM] Processing gift contribution:', contribution.gifts.nome)
        // Add to gifts_received table
        await supabase.from('gifts_received').insert({
          product_id: contribution.gift_id,
          product_name: contribution.gifts.nome,
          guest_name: payment.nome || 'Convidado',
          amount: payment.valor,
          date: new Date().toISOString(),
          payment_id: payment.id,
          mensagem: payment.mensagem,
          tipo: payment.tipo || 'gift',
        })

        // Decrement gift quantity
        await supabase.rpc('decrement_gift_quantity', {
          gift_id: contribution.gift_id
        })
        console.log('[TEST CONFIRM] Gift quantity decremented')
      } else if (payment.tipo === 'gravata') {
        console.log('[TEST CONFIRM] Processing gravata contribution')
        // Add gravata contribution to gifts_received
        await supabase.from('gifts_received').insert({
          product_id: payment.id,
          product_name: 'Gravatinha de Amor',
          guest_name: payment.nome || 'Convidado',
          amount: payment.valor,
          date: new Date().toISOString(),
          payment_id: payment.id,
          mensagem: payment.mensagem,
          tipo: 'gravata',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed manually',
      payment: updatedPayment
    })

  } catch (error) {
    console.error('[TEST CONFIRM] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
