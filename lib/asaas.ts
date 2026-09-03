interface AsaasPaymentRequest {
  customer: string
  customerEmail?: string
  customerPhone?: string
  value: number
  description: string
  dueDate?: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  externalReference?: string
}

interface AsaasPaymentResponse {
  id: string
  status: string
  value: number
  description: string
  pixCode?: string
  pixQrCode?: string
  invoiceUrl?: string
  dueDate?: string
}

interface AsaasWebhookData {
  event: string
  payment: {
    id: string
    status: string
    value: number
    description: string
  }
}

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

export async function createPixPayment(
  data: AsaasPaymentRequest
): Promise<AsaasPaymentResponse> {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY not configured')
  }

  const response = await fetch(`${ASAAS_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
    body: JSON.stringify({
      ...data,
      billingType: 'PIX',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Asaas API error: ${error}`)
  }

  return response.json()
}

export async function getPaymentStatus(paymentId: string): Promise<AsaasPaymentResponse> {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY not configured')
  }

  const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
    headers: {
      'access_token': ASAAS_API_KEY,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Asaas API error: ${error}`)
  }

  return response.json()
}

export async function createWebhook(url: string): Promise<void> {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY not configured')
  }

  const response = await fetch(`${ASAAS_API_URL}/webhooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
    body: JSON.stringify({
      url,
      events: ['PAYMENT_CONFIRMED', 'PAYMENT_DELETED', 'PAYMENT_CANCELLED', 'PAYMENT_EXPIRED'],
      authToken: process.env.ASAAS_WEBHOOK_SECRET,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Asaas webhook error: ${error}`)
  }
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Implement signature verification based on Asaas documentation
  // This is a placeholder - adjust based on actual Asaas webhook security
  return signature === secret
}

export type { AsaasPaymentRequest, AsaasPaymentResponse, AsaasWebhookData }
