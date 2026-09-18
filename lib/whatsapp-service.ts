import { Client, MessageMedia } from 'whatsapp-web.js'

// Armazenamento global para persistir entre recarregamentos de módulos
declare global {
  var whatsappState: {
    client: Client | null
    qrCode: string | null
    isReady: boolean
    isInitializing: boolean
  }
}

if (!global.whatsappState) {
  global.whatsappState = {
    client: null,
    qrCode: null,
    isReady: false,
    isInitializing: false
  }
}

export const getWhatsAppClient = () => {
  if (!global.whatsappState.client && !global.whatsappState.isInitializing) {
    global.whatsappState.isInitializing = true
    console.log('Inicializando WhatsApp Client (básico)...')
    
    try {
      global.whatsappState.client = new Client()

      global.whatsappState.client.on('qr', (qr) => {
        console.log('QR Code recebido!')
        global.whatsappState.qrCode = qr
        console.log('QR Code armazenado:', global.whatsappState.qrCode ? 'Sim' : 'Não')
      })

      global.whatsappState.client.on('ready', () => {
        console.log('WhatsApp Client está pronto!')
        global.whatsappState.isReady = true
        global.whatsappState.qrCode = null
        global.whatsappState.isInitializing = false
      })

      global.whatsappState.client.on('authenticated', () => {
        console.log('WhatsApp Client autenticado!')
      })

      global.whatsappState.client.on('message_create', (msg) => {
        console.log('Mensagem recebida:', msg.body)
      })

      global.whatsappState.client.on('auth_failure', (msg) => {
        console.error('Falha na autenticação:', msg)
        global.whatsappState.isReady = false
        global.whatsappState.isInitializing = false
        global.whatsappState.qrCode = null
      })

      global.whatsappState.client.on('disconnected', (reason) => {
        console.log('WhatsApp Client desconectado:', reason)
        global.whatsappState.isReady = false
        global.whatsappState.isInitializing = false
        global.whatsappState.qrCode = null
        // Reset client para permitir reconexão
        global.whatsappState.client = null
      })

      global.whatsappState.client.on('error', (error) => {
        console.error('Erro no WhatsApp Client:', error)
        global.whatsappState.isInitializing = false
        global.whatsappState.isReady = false
      })

      global.whatsappState.client.initialize().catch((error) => {
        console.error('Erro ao inicializar WhatsApp Client:', error)
        global.whatsappState.isInitializing = false
      })
    } catch (error) {
      console.error('Erro ao criar WhatsApp Client:', error)
      global.whatsappState.isInitializing = false
    }
  }

  return global.whatsappState.client
}

export const getQRCode = () => {
  console.log('getQRCode chamado, retornando:', global.whatsappState.qrCode ? 'QR Code presente' : 'QR Code ausente')
  return global.whatsappState.qrCode
}

export const getIsReady = () => {
  return global.whatsappState.isReady
}

export const sendMessageWithImage = async (
  phoneNumber: string,
  message: string,
  imagePath: string
) => {
  try {
    const client = getWhatsAppClient()
    
    if (!client) {
      throw new Error('WhatsApp Client não está inicializado.')
    }
    
    if (!global.whatsappState.isReady) {
      throw new Error('WhatsApp Client não está pronto. Escaneie o QR code primeiro.')
    }

    // Formatar número para formato WhatsApp (com código do país)
    let formattedNumber = phoneNumber.replace(/\D/g, '')
    
    // Adicionar código do país Brasil se não tiver
    if (!formattedNumber.startsWith('55') && formattedNumber.length === 11) {
      formattedNumber = '55' + formattedNumber
    }
    
    // Remover o 9 extra se tiver 13 dígitos (código país + DDD + 9 + número)
    if (formattedNumber.length === 13 && formattedNumber.startsWith('55')) {
      formattedNumber = formattedNumber.substring(0, 4) + formattedNumber.substring(5)
    }
    
    const chatId = `${formattedNumber}@c.us`
    
    console.log('Enviando mensagem para:', chatId)

    // Enviar mensagem com imagem diretamente
    const media = MessageMedia.fromFilePath(imagePath)
    await client.sendMessage(chatId, media, { caption: message })

    return { success: true, message: 'Mensagem enviada com sucesso!' }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Erro ao enviar mensagem' }
  }
}

export const sendMessageText = async (phoneNumber: string, message: string) => {
  try {
    const client = getWhatsAppClient()
    
    if (!global.whatsappState.isReady) {
      throw new Error('WhatsApp Client não está pronto. Escaneie o QR code primeiro.')
    }

    // Formatar número para formato WhatsApp (com código do país)
    const formattedNumber = phoneNumber.replace(/\D/g, '')
    const chatId = `${formattedNumber}@c.us`

    await client.sendMessage(chatId, message)

    return { success: true, message: 'Mensagem enviada com sucesso!' }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Erro ao enviar mensagem' }
  }
}

export const destroyClient = async () => {
  if (global.whatsappState.client) {
    try {
      await global.whatsappState.client.destroy()
    } catch (error) {
      console.error('Erro ao destruir cliente:', error)
    }
    global.whatsappState.client = null
    global.whatsappState.isReady = false
    global.whatsappState.qrCode = null
    global.whatsappState.isInitializing = false
  }
}

export const resetWhatsAppState = () => {
  console.log('Resetando estado do WhatsApp')
  global.whatsappState.isReady = false
  global.whatsappState.qrCode = null
  global.whatsappState.isInitializing = false
}
