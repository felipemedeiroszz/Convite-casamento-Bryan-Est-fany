# Sistema de Pagamento ASAAS - Guia de Configuração

## Visão Geral

Este sistema integra pagamentos PIX via ASAAS para a lista de presentes do casamento. O fluxo funciona da seguinte maneira:

1. **Convidado escolhe um presente** → Clica em "Presentear"
2. **Sistema cria pagamento PIX** na ASAAS → Retorna QR Code e código copia e cola
3. **Modal mostra QR Code** → Convidado faz o pagamento via PIX
4. **Polling verifica status** → Sistema verifica a cada 5 segundos se o pagamento foi confirmado
5. **Webhook ASAAS** → Quando pagamento é confirmado, ASAAS envia webhook para o sistema
6. **Presente é confirmado** → Sistema registra o presente como recebido

## Configuração Necessária

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Asaas Payment Configuration
ASAAS_API_KEY=your_asaas_api_key
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
# Use https://www.asaas.com/api/v3 para produção

# Webhook Configuration
ASAAS_WEBHOOK_SECRET=your_webhook_secret_for_verification
```

### 2. Configurar Conta ASAAS

1. Crie uma conta em [asaas.com](https://asaas.com)
2. Obtenha sua API Key nas configurações da conta
3. Configure o webhook no painel da ASAAS:
   - URL: `https://seu-dominio.com/api/webhook/asaas`
   - Eventos: `PAYMENT_CONFIRMED`, `PAYMENT_DELETED`, `PAYMENT_CANCELLED`, `PAYMENT_EXPIRED`
   - Autenticação: Use o `ASAAS_WEBHOOK_SECRET`

### 3. Atualizar Schema do Banco de Dados

Execute o SQL atualizado em `supabase/schema.sql` no seu banco Supabase. As alterações incluem:

- Campo `nome` na tabela `payments`
- Campo `payment_id` na tabela `gifts_received`
- Status `EXPIRED` na tabela `payments`
- Tabela `gifts_received` com políticas RLS

### 4. Configurar Webhook Público

Para que o webhook funcione em produção, você precisa:

1. Deploy da aplicação (Vercel, Netlify, etc.)
2. Configurar a URL do webhook no painel ASAAS: `https://seu-dominio.com/api/webhook/asaas`
3. Usar o mesmo `ASAAS_WEBHOOK_SECRET` nas configurações

## Estrutura do Código

### Arquivos Principais

- `lib/asaas.ts` - Funções para integrar com API ASAAS
- `app/api/payments/pix/route.ts` - Cria pagamento PIX
- `app/api/payments/[id]/status/route.ts` - Verifica status do pagamento
- `app/api/webhook/asaas/route.ts` - Recebe webhooks da ASAAS
- `app/presentes/page.tsx` - Página de presentes com modal de pagamento

### Fluxo de Pagamento

```
Frontend (app/presentes/page.tsx)
    ↓
POST /api/payments/pix
    ↓
ASAAS API (cria pagamento PIX)
    ↓
Supabase (salva pagamento)
    ↓
Frontend (mostra modal com QR Code)
    ↓
Polling: GET /api/payments/[id]/status (a cada 5s)
    ↓
ASAAS Webhook → /api/webhook/asaas
    ↓
Supabase (atualiza status e confirma presente)
```

## Estados de Pagamento

- **PENDING**: Pagamento criado, aguardando pagamento
- **CONFIRMED**: Pagamento confirmado, presente recebido
- **CANCELLED**: Pagamento cancelado pelo usuário
- **EXPIRED**: Pagamento expirou (prazo de 3 dias)
- **FAILED**: Pagamento falhou

## Testes

### Ambiente de Sandbox

Para testar no sandbox da ASAAS:

1. Use `ASAAS_API_URL=https://sandbox.asaas.com/api/v3`
2. Use uma API key de sandbox
3. Simule pagamentos no painel sandbox da ASAAS

### Teste Manual

1. Escolha um presente na página `/presentes`
2. Clique em "Presentear"
3. Verifique se o modal aparece com QR Code
4. Copie o código PIX e faça um pagamento de teste
5. Aguarde a confirmação (polling a cada 5s)
6. Verifique se o presente aparece como recebido

## Monitoramento

### Logs de Erros

Verifique os logs do servidor para:
- Erros de integração ASAAS
- Erros de webhook
- Erros de banco de dados

### Dashboard ASAAS

Monitore no painel ASAAS:
- Pagamentos criados
- Pagamentos confirmados
- Webhooks recebidos/enviados

## Troubleshooting

### Webhook não funciona

- Verifique se a URL está correta e pública
- Confirme que o `ASAAS_WEBHOOK_SECRET` é o mesmo
- Verifique os logs do servidor para erros

### Pagamento não é confirmado

- Verifique se o polling está funcionando
- Confirme que o webhook da ASAAS está configurado
- Verifique o status do pagamento no painel ASAAS

### Erro de integração ASAAS

- Verifique se a API key está correta
- Confirme se está usando sandbox ou produção
- Verifique os logs para mensagens de erro específicas

## Segurança

- Nunca commitar `.env.local` no Git
- Usar variáveis de ambiente para chaves sensíveis
- Validar webhooks com `ASAAS_WEBHOOK_SECRET`
- Usar HTTPS em produção
- Limitar acesso às APIs internas
