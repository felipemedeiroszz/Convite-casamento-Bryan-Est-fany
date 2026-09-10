import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createPixPayment } from '@/lib/asaas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      rsvpId,
      giftId,
      valor,
      nome,
      email,
      mensagem,
    } = body

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // ==========================================
    // SUPABASE
    // ==========================================

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          secure: process.env.NODE_ENV === 'production',
        },
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // no-op
          },
        },
      }
    )

    // ==========================================
    // CHECK GIFT AVAILABILITY
    // ==========================================

    if (giftId) {
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .select('quantidade_disponivel')
        .eq('id', giftId)
        .single()

      if (giftError || !gift) {
        return NextResponse.json(
          { error: 'Presente não encontrado' },
          { status: 404 }
        )
      }

      if ((gift.quantidade_disponivel || 0) <= 0) {
        return NextResponse.json(
          { error: 'Presente esgotado' },
          { status: 400 }
        )
      }
    }

    // ==========================================
    // CRIAR PIX NO ASAAS
    // ==========================================

    const payment = await createPixPayment({
      customer: nome || 'Convidado',
      customerName: nome || 'Convidado',
      customerEmail: email || undefined,
      value: Number(valor),
      description: giftId
        ? `Presente: ${giftId}`
        : 'Contribuição para o casamento',
      externalReference: rsvpId || 'gift',
      billingType: 'PIX',
    })

    console.log(
      '[PIX] Pagamento criado:',
      payment.id
    )

    // ==========================================
    // SALVAR NO SUPABASE
    // ==========================================

    const { data: paymentData, error: dbError } =
      await supabase
        .from('payments')
        .insert({
          rsvp_id: rsvpId || null,
          asaas_payment_id: payment.id,
          status: payment.status,
          valor: payment.value,
          descricao: payment.description,

          // Pix copia e cola
          pix_copiacola: payment.pixCode,

          // QR Code Base64
          pix_qr_code: payment.pixQrCode,

          // Expiração real do Asaas
          pix_expiracao: payment.pixExpirationDate,

          nome: nome || 'Convidado',
          mensagem: mensagem || null,
          tipo: giftId
            ? 'gift'
            : 'gravata',
        })
        .select()
        .single()

    if (dbError) {
      console.error(
        'Error saving payment:',
        dbError
      )

      return NextResponse.json(
        {
          error: 'Erro ao salvar pagamento no banco',
        },
        { status: 500 }
      )
    }

    // ==========================================
    // VINCULAR PRESENTE
    // ==========================================

    if (giftId) {
      const { error: giftError } =
        await supabase
          .from('gift_contributions')
          .insert({
            gift_id: giftId,
            rsvp_id: rsvpId || null,
            payment_id: paymentData.id,
            valor: Number(valor),
          })

      if (giftError) {
        console.error(
          'Erro ao salvar contribuição:',
          giftError
        )
      }
    }

    // ==========================================
    // RESPOSTA
    // ==========================================

    return NextResponse.json({
      success: true,

      payment: {
        id: paymentData.id,

        asaasPaymentId: payment.id,

        pixCode: payment.pixCode,

        pixQrCode: payment.pixQrCode,

        value: payment.value,

        status: payment.status,

        expiresAt: payment.pixExpirationDate,
      },
    })

  } catch (error) {

    console.error(
      'Payment creation error:',
      error
    )

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Falha ao criar pagamento'

    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    )
  }
}