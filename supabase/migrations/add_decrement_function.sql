-- Create function to safely decrement gift quantity
create or replace function decrement_gift_quantity(gift_id uuid)
returns void as $$
begin
  update gifts
  set quantidade_disponivel = greatest(quantidade_disponivel - 1, 0)
  where id = gift_id;
end;
$$ language plpgsql;

-- Create function to safely increment gift quantity (for cancelled payments)
create or replace function increment_gift_quantity(gift_id uuid)
returns void as $$
begin
  update gifts
  set quantidade_disponivel = quantidade_disponivel + 1
  where id = gift_id;
end;
$$ language plpgsql;
