import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getPaymentStatus } from '@/lib/asaas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params

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
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (dbError || !payment) {
      console.error('[PAYMENT STATUS] Payment not found:', paymentId, dbError)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('[PAYMENT STATUS] Current DB status:', payment.status, 'Asaas ID:', payment.asaas_payment_id)

    // Check if payment is already confirmed in database
    if (payment.status === 'CONFIRMED') {
      console.log('[PAYMENT STATUS] Already confirmed in DB')
      return NextResponse.json({ status: 'CONFIRMED' })
    }

    // Get status from Asaas
    const asaasPayment = await getPaymentStatus(payment.asaas_payment_id)
    console.log('[PAYMENT STATUS] Asaas status:', asaasPayment.status)

    // Map Asaas status to our internal status
    let mappedStatus = asaasPayment.status
    if (asaasPayment.status === 'RECEIVED' || asaasPayment.status === 'CONFIRMED') {
      mappedStatus = 'CONFIRMED'
    } else if (asaasPayment.status === 'PENDING') {
      mappedStatus = 'PENDING'
    } else if (asaasPayment.status === 'OVERDUE') {
      mappedStatus = 'EXPIRED'
    } else if (asaasPayment.status === 'CANCELLED' || asaasPayment.status === 'DELETED') {
      mappedStatus = 'CANCELLED'
    }

    console.log('[PAYMENT STATUS] Mapped status:', mappedStatus)

    // Update database with current status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: mappedStatus,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (updateError) {
      console.error('[PAYMENT STATUS] Error updating DB:', updateError)
    } else {
      console.log('[PAYMENT STATUS] Updated DB successfully')
    }

    return NextResponse.json({ status: mappedStatus })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
