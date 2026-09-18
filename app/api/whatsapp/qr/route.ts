import { NextResponse } from 'next/server'
import { getWhatsAppClient, getQRCode, getIsReady } from '@/lib/whatsapp-service'

export async function GET() {
  try {
    // Inicializar o cliente se ainda não foi inicializado
    const client = getWhatsAppClient()
    
    // Primeiro verificar se já está pronto
    const ready = getIsReady()
    console.log('Status check - Ready:', ready)
    
    if (ready) {
      return NextResponse.json({ 
        success: true, 
        status: 'ready',
        message: 'WhatsApp já está conectado!' 
      })
    }
    
    // Verificar se já tem QR code
    const existingQR = getQRCode()
    console.log('Status check - QR Code:', existingQR ? 'Presente' : 'Ausente')
    
    if (existingQR) {
      return NextResponse.json({ 
        success: true, 
        status: 'pending',
        qrCode: existingQR
      })
    }
    
    // Polling simples para esperar o QR code
    console.log('Iniciando polling para QR code...')
    let attempts = 0
    const maxAttempts = 20 // 20 tentativas (10 segundos)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Esperar 0.5 segundo
      const qrCode = getQRCode()
      console.log(`Tentativa ${attempts + 1}: QR Code`, qrCode ? 'Presente' : 'Ausente')
      
      if (qrCode) {
        console.log('QR Code encontrado!')
        return NextResponse.json({ 
          success: true, 
          status: 'pending',
          qrCode 
        })
      }
      
      attempts++
    }
    
    console.log('Timeout: QR code não encontrado após 10 segundos')
    return NextResponse.json({ 
      success: true, 
      status: 'initializing',
      message: 'Gerando QR code...' 
    })
  } catch (error) {
    console.error('Erro ao gerar QR code:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar QR code' },
      { status: 500 }
    )
  }
}
