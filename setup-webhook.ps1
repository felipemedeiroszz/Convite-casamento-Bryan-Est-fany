# Script para configurar webhook do Asaas automaticamente
$webhookUrl = "https://seu-dominio.com/api/webhook/asaas"

$body = @{
    webhookUrl = $webhookUrl
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/setup-webhook" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
