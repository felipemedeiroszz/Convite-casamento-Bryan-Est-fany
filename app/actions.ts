'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type RsvpState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export async function submitRsvp(
  _prevState: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const nome = String(formData.get('nome') ?? '').trim()
  const comparecera = String(formData.get('comparecera') ?? 'sim') === 'sim'
  const acompanhantesRaw = Number(formData.get('acompanhantes') ?? 0)
  const mensagem = String(formData.get('mensagem') ?? '').trim()

  if (!nome || nome.length > 120) {
    return {
      status: 'error',
      message: 'Por favor, informe seu nome completo.',
    }
  }

  const acompanhantes =
    Number.isFinite(acompanhantesRaw) && acompanhantesRaw >= 0
      ? Math.min(Math.floor(acompanhantesRaw), 20)
      : 0

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
          // no-op: server action, not persisting a session
        },
      },
    },
  )

  const { error } = await supabase.from('rsvps').insert({
    nome,
    comparecera,
    acompanhantes: comparecera ? acompanhantes : 0,
    mensagem: mensagem || null,
  })

  if (error) {
    console.log('[v0] Erro ao salvar RSVP:', error.message)
    return {
      status: 'error',
      message:
        'Não foi possível registrar sua confirmação agora. Tente novamente em instantes.',
    }
  }

  return {
    status: 'success',
    message: comparecera
      ? 'Presença confirmada! Mal podemos esperar para celebrar com você.'
      : 'Recebemos sua resposta. Sentiremos sua falta, mas agradecemos o carinho.',
  }
}
