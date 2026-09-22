import { NextResponse } from 'next/server'
import { createWebhook } from '@/lib/asaas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhookUrl } = body

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'webhookUrl is required' },
        { status: 400 }
      )
    }

    console.log('[WEBHOOK SETUP] Setting up webhook for:', webhookUrl)

    await createWebhook(webhookUrl)

    return NextResponse.json({
      success: true,
      message: 'Webhook configured successfully',
      webhookUrl
    })
  } catch (error) {
    console.error('[WEBHOOK SETUP] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup webhook' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook setup endpoint',
    instructions: {
      version: 'ASAAS API v3',
      webhookEvents: [
        'PAYMENT_CONFIRMED',
        'PAYMENT_RECEIVED',
        'PAYMENT_DELETED',
        'PAYMENT_OVERDUE',
        'PAYMENT_BANK_SLIP_CANCELLED'
      ],
      endpoint: '/api/webhook/asaas',
      environmentVariables: {
        ASAAS_ACCESS_TOKEN: 'Your Asaas API key',
        ASAAS_WEBHOOK_SECRET: 'Your webhook secret for signature verification'
      },
      exampleWebhookUrl: 'https://your-domain.com/api/webhook/asaas'
    }
  })
}
