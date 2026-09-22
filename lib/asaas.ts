interface AsaasPaymentRequest {
  customer: string
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  value: number
  description: string
  dueDate?: string // ISO format for PIX expiration
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
  pixExpirationDate?: string
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

// Auto-detect API URL based on API key type
function getAsaasApiUrl(): string {
  const customUrl = process.env.ASAAS_API_URL
  if (customUrl) return customUrl

  const apiKey = getAsaasApiKey()
  if (!apiKey) return 'https://api-sandbox.asaas.com/v3'

  // Production keys start with $aact_prod_
  if (apiKey.startsWith('$aact_prod_')) {
    return 'https://api.asaas.com/v3'
  }

  // Sandbox keys start with $aact_hmlg_
  return 'https://api-sandbox.asaas.com/v3'
}

const ASAAS_API_URL = getAsaasApiUrl()

// Function to get API key from environment variables
function getAsaasApiKey(): string | undefined {
  // Try environment variables first
  let apiKey = process.env.ASAAS_ACCESS_TOKEN ||
               process.env.ASAAS_API_KEY ||
               process.env.NEXT_PUBLIC_ASAAS_ACCESS_TOKEN ||
               process.env.NEXT_PUBLIC_ASAAS_API_KEY

  // If not found, try reading from .env file directly (server-side only)
  if (!apiKey && typeof window === 'undefined') {
    try {
      const fs = require('fs')
      const path = require('path')
      const envPath = path.join(process.cwd(), '.env')
      const envContent = fs.readFileSync(envPath, 'utf-8')

      // Simple line-by-line parsing
      const lines = envContent.split('\n')
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('ASAAS_ACCESS_TOKEN=')) {
          apiKey = trimmedLine.split('=')[1].trim()
          break
        }
      }
    } catch (error) {
      console.log('[ASAAS] Could not read .env file:', error)
    }
  }

  console.log('[ASAAS] API Key check:', {
    apiKeyFound: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyStart: apiKey?.substring(0, 20) || 'none'
  })

  return apiKey
}

const ASAAS_API_KEY = getAsaasApiKey()
const USE_MOCK_PAYMENT = process.env.USE_MOCK_PAYMENT === 'true'

/**
 * Headers padrão da API Asaas
 */
function getHeaders() {
  const apiKey = getAsaasApiKey()
  if (!apiKey) {
    throw new Error(
      'ASAAS_ACCESS_TOKEN não configurado no arquivo .env'
    )
  }

  return {
    'Content-Type': 'application/json',
    'access_token': apiKey.trim(),
  }
}

/**
 * Cria ou obtém um cliente no Asaas
 */
async function createOrGetCustomer(
  name: string,
  email?: string
): Promise<string> {
  const apiKey = getAsaasApiKey()
  if (!apiKey) {
    throw new Error('ASAAS_ACCESS_TOKEN não configurado')
  }

  // First, try to find existing customer by email
  if (email) {
    try {
      const searchResponse = await fetch(
        `${ASAAS_API_URL}/customers?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'access_token': apiKey.trim(),
          },
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.data && searchData.data.length > 0) {
          console.log('[ASAAS] Cliente existente encontrado:', searchData.data[0].id)
          return searchData.data[0].id
        }
      }
    } catch (error) {
      console.log('[ASAAS] Erro ao buscar cliente, criando novo:', error)
    }
  }

  // Create new customer
  const customerResponse = await fetch(
    `${ASAAS_API_URL}/customers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey.trim(),
      },
      body: JSON.stringify({
        name: name,
        email: email || undefined,
        cpfCnpj: '12934080773', // CPF fixo para testes
      }),
    }
  )

  const customerText = await customerResponse.text()
  let customerJson: any

  try {
    customerJson = JSON.parse(customerText)
  } catch {
    throw new Error(`Resposta inválida do Asaas ao criar cliente. HTTP ${customerResponse.status}`)
  }

  if (!customerResponse.ok) {
    console.error('[ASAAS] Erro ao criar cliente:', customerJson)
    throw new Error(`Asaas customer error: ${JSON.stringify(customerJson)}`)
  }

  console.log('[ASAAS] Cliente criado:', customerJson.id)
  return customerJson.id
}

/**
 * Cria uma cobrança PIX no Asaas
 * e depois busca o QR Code/Pix Copia e Cola.
 */
export async function createPixPayment(
  data: AsaasPaymentRequest
): Promise<AsaasPaymentResponse> {

  // ==========================================
  // MOCK
  // ==========================================

  if (USE_MOCK_PAYMENT) {
    console.log('[MOCK PAYMENT] Criando pagamento:', data)

    // Validate minimum values even in mock mode
    const isGravata = !data.description.includes('Presente:')
    const minValue = isGravata ? 20 : 1

    if (data.value < minValue) {
      throw new Error(
        isGravata ? 'O valor mínimo para gravata é R$ 20,00' : 'O valor mínimo para presente é R$ 1,00'
      )
    }

    const mockPaymentId =
      `mock_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`

    const mockPixCode =
      `00020126580014BR.GOV.BCB.PIX0136${mockPaymentId}` +
      `5204000053039865405${data.value.toFixed(2)}` +
      `5802BR5925Casamento Teste Mock6009Sao Paulo` +
      `62070503***6304ABCD`

    const mockQrCode =
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        mockPixCode
      )}`

    const mockExpirationDate = new Date()
    mockExpirationDate.setMinutes(mockExpirationDate.getMinutes() + 5)

    return {
      id: mockPaymentId,
      status: 'PENDING',
      value: data.value,
      description: data.description,
      pixCode: mockPixCode,
      pixQrCode: mockQrCode,
      pixExpirationDate: mockExpirationDate.toISOString(),
    }
  }

  // ==========================================
  // VALIDAR CONFIGURAÇÃO
  // ==========================================

  const apiKey = getAsaasApiKey()
  if (!apiKey) {
    throw new Error(
      'ASAAS_ACCESS_TOKEN não configurado no arquivo .env'
    )
  }

  console.log('[ASAAS] URL:', ASAAS_API_URL)
  console.log('[ASAAS] Token configurado:', apiKey.substring(0, 15) + '...')

  // ==========================================
  // 1. CRIAR/OBTER CLIENTE
  // ==========================================

  const customerId = await createOrGetCustomer(
    data.customerName || data.customer,
    data.customerEmail
  )

  // ==========================================
  // 2. CRIAR COBRANÇA PIX
  // ==========================================

  const paymentResponse = await fetch(
    `${ASAAS_API_URL}/payments`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        customer: customerId,
        value: data.value,
        description: data.description,
        billingType: 'PIX',
        // dueDate: Adicionado para compatibilidade com API Asaas (3 dias no futuro)
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        externalReference: data.externalReference,
      }),
      cache: 'no-store',
    }
  )

  const paymentText = await paymentResponse.text()

  let paymentJson: any

  try {
    paymentJson = JSON.parse(paymentText)
  } catch {
    console.error(
      '[ASAAS] Resposta não-JSON ao criar pagamento:',
      paymentText.substring(0, 1000)
    )

    throw new Error(
      `Resposta inválida do Asaas ao criar pagamento. HTTP ${paymentResponse.status}`
    )
  }

  if (!paymentResponse.ok) {
    console.error(
      '[ASAAS] Erro ao criar pagamento:',
      paymentJson
    )

    throw new Error(
      `Asaas API error: ${JSON.stringify(paymentJson)}`
    )
  }

  console.log(
    '[ASAAS] Pagamento criado:',
    paymentJson.id
  )

  // ==========================================
  // 3. BUSCAR QR CODE PIX
  // ==========================================

  const qrResponse = await fetch(
    `${ASAAS_API_URL}/payments/${paymentJson.id}/pixQrCode`,
    {
      method: 'GET',
      headers: {
        'access_token': apiKey.trim(),
      },
      cache: 'no-store',
    }
  )

  const qrText = await qrResponse.text()

  let qrJson: any

  try {
    qrJson = JSON.parse(qrText)
  } catch {
    console.error(
      '[ASAAS] Resposta não-JSON ao buscar QR Code:',
      qrText.substring(0, 1000)
    )

    throw new Error(
      `Resposta inválida do Asaas ao buscar QR Code. HTTP ${qrResponse.status}`
    )
  }

  if (!qrResponse.ok) {
    console.error(
      '[ASAAS] Erro ao buscar QR Code:',
      qrJson
    )

    throw new Error(
      `Asaas QR Code error: ${JSON.stringify(qrJson)}`
    )
  }

  console.log('[ASAAS] QR Code Pix obtido com sucesso')
  console.log('[ASAAS] QR Code response:', {
    hasPayload: !!qrJson.payload,
    payloadLength: qrJson.payload?.length || 0,
    hasEncodedImage: !!qrJson.encodedImage,
    encodedImageLength: qrJson.encodedImage?.length || 0,
    encodedImageStart: qrJson.encodedImage?.substring(0, 50) || 'none'
  })

  // ==========================================
  // 4. RETORNAR TUDO PARA A API
  // ==========================================

  return {
    id: paymentJson.id,
    status: paymentJson.status,
    value: paymentJson.value,
    description: paymentJson.description,

    // Pix copia e cola
    pixCode: qrJson.payload,

    // Base64 da imagem formatado como data URL
    pixQrCode: qrJson.encodedImage ? `data:image/png;base64,${qrJson.encodedImage}` : undefined,

    // Expiração real informada pelo Asaas (geralmente 30 minutos)
    pixExpirationDate: qrJson.expirationDate,

    invoiceUrl: paymentJson.invoiceUrl,
  }
}

/**
 * Consulta status de um pagamento.
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<AsaasPaymentResponse> {

  if (USE_MOCK_PAYMENT || paymentId.startsWith('mock_')) {
    return {
      id: paymentId,
      status: 'PENDING',
      value: 0,
      description: 'Mock payment',
    }
  }

  const apiKey = getAsaasApiKey()
  if (!apiKey) {
    throw new Error(
      'ASAAS_ACCESS_TOKEN não configurado no arquivo .env'
    )
  }

  const response = await fetch(
    `${ASAAS_API_URL}/payments/${paymentId}`,
    {
      method: 'GET',
      headers: {
        'access_token': apiKey.trim(),
      },
      cache: 'no-store',
    }
  )

  const text = await response.text()

  let json: any

  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(
      `Resposta inválida do Asaas. HTTP ${response.status}`
    )
  }

  if (!response.ok) {
    throw new Error(
      `Asaas API error: ${JSON.stringify(json)}`
    )
  }

  return json
}

/**
 * Cria um webhook no Asaas.
 */
export async function createWebhook(
  url: string
): Promise<void> {

  const apiKey = getAsaasApiKey()
  if (!apiKey) {
    throw new Error(
      'ASAAS_ACCESS_TOKEN não configurado no arquivo .env'
    )
  }

  const response = await fetch(
    `${ASAAS_API_URL}/webhooks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey.trim(),
      },
      body: JSON.stringify({
        url,
        events: [
          'PAYMENT_CONFIRMED',
          'PAYMENT_RECEIVED',
          'PAYMENT_DELETED',
          'PAYMENT_OVERDUE',
          'PAYMENT_BANK_SLIP_CANCELLED',
        ],
        authToken: process.env.ASAAS_WEBHOOK_SECRET,
      }),
    }
  )

  const text = await response.text()

  let json: any

  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(
      `Resposta inválida do Asaas ao criar webhook. HTTP ${response.status}`
    )
  }

  if (!response.ok) {
    throw new Error(
      `Asaas webhook error: ${JSON.stringify(json)}`
    )
  }
}

/**
 * Verificação básica do webhook.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  return signature === secret
}

export type {
  AsaasPaymentRequest,
  AsaasPaymentResponse,
  AsaasWebhookData,
}