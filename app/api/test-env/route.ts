import { NextResponse } from 'next/server'

export async function GET() {
  const asaasVars = Object.keys(process.env)
    .filter(key => key.includes('ASAAS'))
    .reduce((acc, key) => {
      const value = process.env[key]
      if (value) {
        acc[key] = {
          length: value.length,
          first_chars: value.substring(0, 30),
          last_chars: value.substring(value.length - 30),
        }
      } else {
        acc[key] = 'NOT_SET'
      }
      return acc
    }, {} as Record<string, any>)

  return NextResponse.json({
    asaas_environment_variables: asaasVars,
    asaas_api_url: process.env.ASAAS_API_URL,
    use_mock_payment: process.env.USE_MOCK_PAYMENT,
  })
}
