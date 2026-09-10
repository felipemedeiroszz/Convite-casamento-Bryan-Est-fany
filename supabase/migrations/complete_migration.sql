-- ==========================================
-- MIGRAÇÃO COMPLETA - SISTEMA DE PRESENTES
-- ==========================================
-- Este arquivo contém todas as alterações necessárias
-- para implementar o sistema de controle de estoque
-- ==========================================

-- 1. Adicionar campo quantidade_disponivel na tabela gifts
alter table gifts add column if not exists quantidade_disponivel integer default 9999;

-- 2. Atualizar valores existentes com quantidades específicas
update gifts set quantidade_disponivel = 5 where nome = 'Lua de Mel';
update gifts set quantidade_disponivel = 10 where nome = 'Jantar Romântico';
update gifts set quantidade_disponivel = 15 where nome = 'Decoração Casa Nova';
update gifts set quantidade_disponivel = 8 where nome = 'Aparelho de Cozinha';
update gifts set quantidade_disponivel = 20 where nome = 'Livros e Cultura';
update gifts set quantidade_disponivel = 9999 where nome = 'Valor Livre';

-- 3. Criar função para decrementar estoque de forma segura
create or replace function decrement_gift_quantity(gift_id uuid)
returns void as $$
begin
  update gifts
  set quantidade_disponivel = greatest(quantidade_disponivel - 1, 0)
  where id = gift_id;
end;
$$ language plpgsql;

-- 4. Criar função para incrementar estoque (para pagamentos cancelados)
create or replace function increment_gift_quantity(gift_id uuid)
returns void as $$
begin
  update gifts
  set quantidade_disponivel = quantidade_disponivel + 1
  where id = gift_id;
end;
$$ language plpgsql;

-- 5. Verificar se as alterações foram aplicadas corretamente
select 
    'Migration completed successfully' as status,
    (select count(*) from gifts where quantidade_disponivel is not null) as gifts_with_quantity,
    (select count(*) from gifts where quantidade_disponivel > 0) as available_gifts,
    (select count(*) from gifts where quantidade_disponivel = 0) as sold_out_gifts;

-- ==========================================
-- RESUMO DAS ALTERAÇÕES:
-- ==========================================
-- ✅ Campo quantidade_disponivel adicionado à tabela gifts
-- ✅ Valores padrão configurados para presentes existentes
-- ✅ Função decrement_gift_quantity criada (usada no webhook quando pagamento é confirmado)
-- ✅ Função increment_gift_quantity criada (usada no webhook quando pagamento é cancelado)
-- ✅ Sistema pronto para controle de estoque automático
-- ==========================================