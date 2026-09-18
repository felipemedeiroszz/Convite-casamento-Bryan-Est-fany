import { NextRequest, NextResponse } from 'next/server'
import { sendMessageWithImage } from '@/lib/whatsapp-service'
import path from 'path'

// Função para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumbers, message, imagePath } = body

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Números de telefone são obrigatórios' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Usar caminho da imagem fornecido ou padrão
    const finalImagePath = imagePath || path.join(process.cwd(), 'public', 'convite.jpeg')

    const results = []
    
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i]
      const result = await sendMessageWithImage(phoneNumber, message, finalImagePath)
      results.push({
        phoneNumber,
        ...result
      })
      
      // Delay de 1 segundo entre mensagens para evitar bloqueios
      if (i < phoneNumbers.length - 1) {
        await delay(1000)
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      total: results.length,
      successCount,
      failCount,
      results
    })
  } catch (error) {
    console.error('Erro ao enviar mensagens:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Erro ao enviar mensagens' },
      { status: 500 }
    )
  }
}
