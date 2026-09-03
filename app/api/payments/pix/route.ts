import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createPixPayment } from '@/lib/asaas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rsvpId, giftId, valor, nome, email, mensagem } = body

    if (!valor || valor <= 0) {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
    }

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

    // Create payment in Asaas
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3) // 3 days to pay

    const payment = await createPixPayment({
      customer: nome || 'Convidado',
      customerEmail: email,
      value: valor,
      description: giftId ? `Presente: ${giftId}` : 'Contribuição para o casamento',
      dueDate: dueDate.toISOString().split('T')[0],
      externalReference: rsvpId || 'gift',
      billingType: 'PIX',
    })

    // Save payment to database
    const { data: paymentData, error: dbError } = await supabase
      .from('payments')
      .insert({
        rsvp_id: rsvpId || null,
        asaas_payment_id: payment.id,
        status: payment.status,
        valor: payment.value,
        descricao: payment.description,
        pix_copiacola: payment.pixCode,
        pix_qr_code: payment.pixQrCode,
        pix_expiracao: dueDate.toISOString(),
        nome: nome || 'Convidado',
        mensagem: mensagem || null,
        tipo: giftId ? 'gift' : 'gravata',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving payment:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // If it's a gift contribution, link it
    if (giftId) {
      await supabase.from('gift_contributions').insert({
        gift_id: giftId,
        rsvp_id: rsvpId || null,
        payment_id: paymentData.id,
        valor: valor,
      })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentData.id,
        pixCode: payment.pixCode,
        pixQrCode: payment.pixQrCode,
        value: payment.value,
        expiresAt: dueDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment creation failed' },
      { status: 500 }
    )
  }
}
