import { NextResponse } from 'next/server'
import { createPixPayment } from '@/lib/asaas'

export async function GET() {
  try {
    const payment = await createPixPayment({
      customer: 'Test Customer',
      customerEmail: 'test@example.com',
      value: 10,
      description: 'Test payment',
      billingType: 'PIX',
    })

    return NextResponse.json({
      success: true,
      payment,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
