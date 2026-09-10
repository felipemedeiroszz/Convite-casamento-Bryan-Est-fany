import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabase = isSupabaseConfigured
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase não configurado' },
      { status: 500 }
    )
  }

  try {
    const params = await context.params
    const id = params?.id

    if (!id || id === 'undefined' || id.trim() === '') {
      console.error('[PATCH gifts] ID INVÁLIDO recebido:', id)
      return NextResponse.json(
        { error: 'ID do produto inválido ou não informado' },
        { status: 400 }
      )
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: `ID não é um UUID válido: ${id}` },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log('\n[PATCH gifts] Recebido ID:', id)
    console.log('[PATCH gifts] Body original:', JSON.stringify(body, null, 2))

    const allowedFields: Record<string, unknown> = {}

    if (body.nome !== undefined) allowedFields.nome = body.nome
    if (body.descricao !== undefined) allowedFields.descricao = body.descricao
    if (body.valor !== undefined) {
      const v = Number(body.valor)
      if (isNaN(v)) {
        return NextResponse.json({ error: `Valor inválido: ${body.valor}` }, { status: 400 })
      }
      allowedFields.valor = v
    }
    if (body.imagem_url !== undefined) allowedFields.imagem_url = body.imagem_url
    if (body.quantidade_disponivel !== undefined) {
      const q = Number(body.quantidade_disponivel)
      if (isNaN(q) || q < 0) {
        return NextResponse.json({ error: `Quantidade inválida: ${body.quantidade_disponivel}` }, { status: 400 })
      }
      allowedFields.quantidade_disponivel = q
    }
    if (body.ativo !== undefined) allowedFields.ativo = Boolean(body.ativo)
    if (body.ordem !== undefined) {
      const o = Number(body.ordem)
      if (isNaN(o)) {
        return NextResponse.json({ error: `Ordem inválida: ${body.ordem}` }, { status: 400 })
      }
      allowedFields.ordem = o
    }

    console.log('[PATCH gifts] Campos a atualizar:', JSON.stringify(allowedFields, null, 2))

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
    }

    const { data, error } = await supabase!
      .from('gifts')
      .update(allowedFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('\n[ERRO SUPABASE PATCH gifts]:')
      console.error('  message:', error.message)
      console.error('  code:', error.code)
      console.error('  details:', error.details)
      console.error('  hint:', error.hint)
      throw error
    }

    console.log('[PATCH gifts] Sucesso:', data)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('\n[EXCEPTION PATCH gifts] Erro completo:', error)
    const rawMessage = error?.message || 'Erro desconhecido'
    const details = error?.details ? ` (${error.details})` : ''
    const code = error?.code ? ` [cod:${error.code}]` : ''
    const friendlyMessage = `Falha ao atualizar presente${code}: ${rawMessage}${details}`
    return NextResponse.json({ error: friendlyMessage }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase não configurado' },
      { status: 500 }
    )
  }

  try {
    const params = await context.params
    const { error } = await supabase!
      .from('gifts')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gift:', error)
    return NextResponse.json({ error: 'Falha ao excluir presente' }, { status: 500 })
  }
}
