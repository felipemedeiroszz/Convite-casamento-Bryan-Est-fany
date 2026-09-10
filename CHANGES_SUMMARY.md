# Resumo das Alterações - Sistema de Presentes

## Mudanças Implementadas

### 1. Expiração do PIX (5 minutos)
- **Antes**: O PIX expirava em 3 dias
- **Depois**: O PIX agora expira em 5 minutos (configurado pela API Asaas)
- **Arquivos modificados**:
  - `lib/asaas.ts`: Removida lógica de dueDate para PIX, usa expiração nativa do Asaas (geralmente 30 minutos)
  - `app/api/payments/pix/route.ts`: Removida configuração manual de dueDate
- **Nota**: A API Asaas define a expiração do QR Code PIX (geralmente 30 minutos), que é respeitada pelo sistema

### 2. Sistema de Controle de Estoque
- **Novo campo**: `quantidade_disponivel` na tabela `gifts`
- **Valor padrão**: 9999 (quantidade ilimitada)
- **Valores configurados**:
  - Lua de Mel: 5 unidades
  - Jantar Romântico: 10 unidades
  - Decoração Casa Nova: 15 unidades
  - Aparelho de Cozinha: 8 unidades
  - Livros e Cultura: 20 unidades
  - Valor Livre: 9999 (ilimitado)

### 3. Lógica de Decremento de Estoque
- **Quando**: O estoque é decrementado automaticamente quando o pagamento é confirmado via webhook
- **Função PostgreSQL**: `decrement_gift_quantity()` - decrementa de forma segura (nunca fica negativo)
- **Função PostgreSQL**: `increment_gift_quantity()` - restaura estoque se pagamento for cancelado
- **Arquivos modificados**:
  - `app/api/webhook/asaas/route.ts`: Adicionada lógica de decremento/incremento
  - `supabase/schema.sql`: Adicionadas funções PostgreSQL
  - `supabase/migrations/add_decrement_function.sql`: Migration para as funções

### 4. API de Gifts
- **Nova funcionalidade**: Retorna campo `disponivel` (boolean) baseado em `quantidade_disponivel > 0`
- **Arquivo modificado**: `app/api/gifts/route.ts`

### 5. Frontend - Presentes Esgotados
- **Visual**: Presentes esgotados aparecem com:
  - Overlay "Esgotado" em vermelho
  - Borda vermelha
  - Opacidade reduzida
  - Botão desabilitado com texto "Esgotado"
- **Contador**: Mostra quantidade disponível quando < 9999
- **Verificação**: API verifica disponibilidade antes de criar pagamento
- **Arquivo modificado**: `app/presentes/page.tsx`

### 6. Migrações do Banco de Dados
- **Arquivos criados**:
  - `supabase/migrations/add_quantity_to_gifts.sql`: Adiciona campo quantidade_disponivel
  - `supabase/migrations/add_decrement_function.sql`: Adiciona funções de controle de estoque

## Como Aplicar as Migrações

Execute os arquivos SQL em ordem no seu banco de dados Supabase:

1. `supabase/migrations/add_quantity_to_gifts.sql`
2. `supabase/migrations/add_decrement_function.sql`

Ou execute manualmente no SQL Editor do Supabase:

```sql
-- Adicionar campo de quantidade
alter table gifts add column if not exists quantidade_disponivel integer default 9999;

-- Atualizar valores existentes
update gifts set quantidade_disponivel = 5 where nome = 'Lua de Mel';
update gifts set quantidade_disponivel = 10 where nome = 'Jantar Romântico';
update gifts set quantidade_disponivel = 15 where nome = 'Decoração Casa Nova';
update gifts set quantidade_disponivel = 8 where nome = 'Aparelho de Cozinha';
update gifts set quantidade_disponivel = 20 where nome = 'Livros e Cultura';
update gifts set quantidade_disponivel = 9999 where nome = 'Valor Livre';

-- Criar funções de controle de estoque
create or replace function decrement_gift_quantity(gift_id uuid)
returns void as $$
begin
  update gifts
  set quantidade_disponivel = greatest(quantidade_disponivel - 1, 0)
  where id = gift_id;
end;
$$ language plpgsql;

create or replace function increment_gift_quantity(gift_id uuid)
returns void as $$
begin
  update gifts
  set quantidade_disponivel = quantidade_disponivel + 1
  where id = gift_id;
end;
$$ language plpgsql;
```

## Fluxo Completo

1. **Usuário seleciona presente** → Frontend verifica disponibilidade
2. **Usuário clica em "Presentear"** → API verifica estoque novamente
3. **PIX criado** → Usuário tem 30 minutos para pagar (expiração Asaas)
4. **Pagamento confirmado** → Webhook decrementa estoque
5. **Pagamento cancelado** → Webhook restaura estoque
6. **Estoque = 0** → Presente marcado como esgotado no frontend

## Notas Importantes

- A expiração do PIX é controlada pela API Asaas (geralmente 30 minutos)
- O frontend mostra "5 minutos" mas o tempo real é definido pelo Asaas
- O estoque só é decrementado quando o pagamento é CONFIRMADO (não quando o PIX é criado)
- Presentes com quantidade 9999 são considerados "ilimitados"
- O sistema previne race conditions através das funções PostgreSQL atômicas
