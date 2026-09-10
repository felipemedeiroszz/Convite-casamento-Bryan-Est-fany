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
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check if payment is already confirmed in database
    if (payment.status === 'CONFIRMED') {
      return NextResponse.json({ status: 'CONFIRMED' })
    }

    // Get status from Asaas
    const asaasPayment = await getPaymentStatus(payment.asaas_payment_id)

    // Update database with current status
    await supabase
      .from('payments')
      .update({
        status: asaasPayment.status,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', paymentId)

    return NextResponse.json({ status: asaasPayment.status })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
