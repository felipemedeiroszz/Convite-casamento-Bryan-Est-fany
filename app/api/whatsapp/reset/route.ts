import { NextResponse } from 'next/server'
import { resetWhatsAppState } from '@/lib/whatsapp-service'

export async function POST() {
  try {
    resetWhatsAppState()
    return NextResponse.json({ 
      success: true, 
      message: 'Estado do WhatsApp resetado com sucesso!' 
    })
  } catch (error) {
    console.error('Erro ao resetar estado:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao resetar estado' },
      { status: 500 }
    )
  }
}