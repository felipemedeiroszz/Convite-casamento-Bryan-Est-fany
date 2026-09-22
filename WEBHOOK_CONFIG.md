# Configuração do Webhook Asaas

## Informações do Asaas

### 📋 **Versão da API**
- **Versão:** ASAAS API v3
- **URL Produção:** `https://api.asaas.com/v3`
- **URL Sandbox:** `https://api-sandbox.asaas.com/v3`

### 🔗 **URL do Webhook**
O endpoint do webhook no seu sistema é:
```
https://seu-dominio.com/api/webhook/asaas
```

Em desenvolvimento (localhost):
```
http://localhost:3000/api/webhook/asaas
```

### 📡 **Eventos do Webhook**
O sistema está configurado para receber os seguintes eventos do Asaas:

1. **PAYMENT_CONFIRMED** - Pagamento confirmado
2. **PAYMENT_RECEIVED** - Pagamento recebido
3. **PAYMENT_DELETED** - Pagamento deletado
4. **PAYMENT_OVERDUE** - Pagamento vencido
5. **PAYMENT_BANK_SLIP_CANCELLED** - Boleto cancelado

## 🔧 **Configuração Passo a Passo**

### 1. Variáveis de Ambiente

No arquivo `.env`, configure:

```env
# Asaas API Key
ASAAS_ACCESS_TOKEN=$aact_prod_XXXXXXXXXXXXXX

# Webhook Secret (opcional, para verificação de assinatura)
ASAAS_WEBHOOK_SECRET=sua_chave_secreta_aqui
```

### 2. Configurar Webhook via API do Asaas

**Manualmente no painel do Asaas:**
1. Acesse o painel do Asaas: https://asaas.com/
2. Vá em: Integrações > Webhooks
3. Clique em "Novo Webhook"
4. Configure:
   - **URL:** `https://seu-dominio.com/api/webhook/asaas`
   - **Eventos:** Selecione todos os eventos listados acima
   - **Auth Token:** Use o mesmo valor de `ASAAS_WEBHOOK_SECRET`

**Via API (usando o endpoint de setup):**
```bash
curl -X POST http://localhost:3000/api/setup-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://seu-dominio.com/api/webhook/asaas"}'
```

### 3. Testar Webhook

Use o endpoint de teste para simular um webhook:
```bash
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "UUID_DO_PAGAMENTO"}'
```

## 🛠️ **Endpoint de Configuração Automática**

### GET /api/setup-webhook
Retorna informações sobre a configuração do webhook

### POST /api/setup-webhook
Configura automaticamente o webhook no Asaas

**Body:**
```json
{
  "webhookUrl": "https://seu-dominio.com/api/webhook/asaas"
}
```

## 🔍 **Verificação de Logs**

O sistema inclui logs detalhados para debug:

- `[WEBHOOK]` - Logs do endpoint do webhook
- `[PAYMENT STATUS]` - Logs de verificação de status
- `[ASAAS]` - Logs de chamadas à API do Asaas
- `[POLLING]` - Logs do polling de status no frontend

## ⚠️ **Considerações Importantes**

1. **URL Pública:** Para que o webhook funcione em produção, sua URL deve ser pública e acessível pela internet
2. **HTTPS:** Recomendado usar HTTPS em produção
3. **Webhook Secret:** Configure `ASAAS_WEBHOOK_SECRET` para segurança adicional
4. **Sandbox vs Produção:** O sistema detecta automaticamente se está usando chave de sandbox ou produção

## 📝 **Exemplo de Payload do Webhook**

```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_XXXXXXXXXXXX",
    "status": "CONFIRMED",
    "value": 100.00,
    "description": "Presente: UUID"
  }
}
```

## 🧪 **Testes Locais**

Para testar webhooks localmente, você pode usar ferramentas como:
- **ngrok:** `ngrok http 3000`
- **localtunnel:** `lt --port 3000`
- **cloudflare tunnel:** `cloudflared tunnel`

Isso cria uma URL pública que aponta para seu localhost.
