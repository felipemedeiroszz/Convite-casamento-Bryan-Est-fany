import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BUCKET_NAME = 'gift-images'

const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabase = isSupabaseConfigured
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null

let bucketVerified = false

async function ensureBucketExists() {
  if (!supabase || bucketVerified) return

  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some((b) => b.id === BUCKET_NAME)

  if (!bucketExists) {
    console.log(`Bucket "${BUCKET_NAME}" não encontrado. Criando...`)
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/*'],
    })

    if (error) {
      console.error('Erro ao criar bucket:', error)
      throw new Error(
        `Bucket "${BUCKET_NAME}" não existe e não foi possível criar. Acesse o SQL Editor do Supabase e execute o script de storage.sql. Detalhe: ${error.message}`
      )
    }
    console.log(`Bucket "${BUCKET_NAME}" criado com sucesso!`)
  }

  bucketVerified = true
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    )
  }

  try {
    await ensureBucketExists()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Arquivo vazio' }, { status: 400 })
    }

    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const originalExt = file.name.split('.').pop()?.toLowerCase() || ''
    if (!allowedExts.includes(originalExt)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use: jpg, jpeg, png, gif ou webp' },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Limite de 5MB' },
        { status: 400 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileExt = safeName.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
    const filePath = `gifts/${fileName}`

    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase!
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'image/octet-stream',
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Erro ao enviar imagem para storage' },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase!
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl, path: filePath })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado ao enviar imagem'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
