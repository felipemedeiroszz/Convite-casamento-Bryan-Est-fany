import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { verifyWebhookSignature, type AsaasWebhookData } from '@/lib/asaas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('asaas-signature') || ''
    
    // Verify webhook signature
    const secret = process.env.ASAAS_WEBHOOK_SECRET
    if (!secret || !verifyWebhookSignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data: AsaasWebhookData = JSON.parse(body)
    
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

    // Update payment status in database
    if (data.event === 'PAYMENT_CONFIRMED') {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'CONFIRMED',
          atualizado_em: new Date().toISOString(),
          webhook_data: data,
        })
        .eq('asaas_payment_id', data.payment.id)
        .select()
        .single()

      if (paymentError) {
        console.error('Error updating payment:', paymentError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      // If payment is linked to a gift, mark it as received
      if (payment) {
        // Check if there's a gift contribution
        const { data: contribution } = await supabase
          .from('gift_contributions')
          .select('*, gifts(*)')
          .eq('payment_id', payment.id)
          .single()

        if (contribution && contribution.gifts) {
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

          // Update gift status if needed
          await supabase
            .from('gifts')
            .update({ status: 'received' })
            .eq('id', contribution.gift_id)
        } else if (payment.tipo === 'gravata') {
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
    } else if (data.event === 'PAYMENT_DELETED' || data.event === 'PAYMENT_CANCELLED' || data.event === 'PAYMENT_EXPIRED') {
      const status = data.event === 'PAYMENT_EXPIRED' ? 'EXPIRED' : 'CANCELLED'
      
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({
          status,
          atualizado_em: new Date().toISOString(),
          webhook_data: data,
        })
        .eq('asaas_payment_id', data.payment.id)
        .select()
        .single()

      if (paymentError) {
        console.error('Error updating payment:', paymentError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      // If payment was linked to a gift, remove the contribution
      if (payment) {
        await supabase
          .from('gift_contributions')
          .delete()
          .eq('payment_id', payment.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
