import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const envPath = join(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    
    const lines = envContent.split('\n')
    const asaasTokenLine = lines.find(line => line.includes('ASAAS_ACCESS_TOKEN'))
    const asaasUrlLine = lines.find(line => line.includes('ASAAS_API_URL'))
    
    return NextResponse.json({
      file_exists: true,
      file_length: envContent.length,
      asaas_token_line: asaasTokenLine,
      asaas_url_line: asaasUrlLine,
      line_count: lines.length,
      empty_lines: lines.filter(line => line.trim() === '').length,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to read .env file',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
