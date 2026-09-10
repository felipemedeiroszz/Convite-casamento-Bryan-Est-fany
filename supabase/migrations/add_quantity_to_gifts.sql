-- Add quantidade_disponivel column to gifts table
alter table gifts add column if not exists quantidade_disponivel integer default 9999;

-- Update existing gifts with default quantities
update gifts set quantidade_disponivel = 5 where nome = 'Lua de Mel';
update gifts set quantidade_disponivel = 10 where nome = 'Jantar Romântico';
update gifts set quantidade_disponivel = 15 where nome = 'Decoração Casa Nova';
update gifts set quantidade_disponivel = 8 where nome = 'Aparelho de Cozinha';
update gifts set quantidade_disponivel = 20 where nome = 'Livros e Cultura';
update gifts set quantidade_disponivel = 9999 where nome = 'Valor Livre';
