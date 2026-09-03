-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create guests table (for admin management)
create table if not exists guests (
  id uuid default uuid_generate_v4() primary key,
  nome_completo text not null unique,
  email text,
  telefone text,
  whatsapp text,
  status text not null default 'pending', -- pending, confirmed, declined
  criado_em timestamp with time zone default now(),
  atualizado_em timestamp with time zone default now()
);

-- Create RSVPs table
create table if not exists rsvps (
  id uuid default uuid_generate_v4() primary key,
  guest_id uuid references guests(id) on delete set null,
  nome text not null,
  comparecera boolean not null default true,
  acompanhantes integer default 0 check (acompanhantes >= 0 and acompanhantes <= 20),
  mensagem text,
  criado_em timestamp with time zone default now(),
  atualizado_em timestamp with time zone default now()
);

-- Create companion_attendance table (for tracking individual companions)
create table if not exists companion_attendance (
  id uuid default uuid_generate_v4() primary key,
  rsvp_id uuid references rsvps(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  nome text not null,
  status text not null default 'pending', -- pending, confirmed, declined
  criado_em timestamp with time zone default now(),
  atualizado_em timestamp with time zone default now()
);

-- Create payments table
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  rsvp_id uuid references rsvps(id) on delete set null,
  asaas_payment_id text unique,
  status text not null default 'PENDING', -- PENDING, CONFIRMED, FAILED, CANCELLED, EXPIRED
  valor numeric not null,
  descricao text,
  pix_copiacola text,
  pix_qr_code text,
  pix_expiracao timestamp with time zone,
  nome text,
  mensagem text,
  tipo text default 'gift', -- gift, gravata
  criado_em timestamp with time zone default now(),
  atualizado_em timestamp with time zone default now(),
  webhook_data jsonb
);

-- Create gifts table
create table if not exists gifts (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  descricao text,
  valor numeric not null,
  imagem_url text,
  ativo boolean default true,
  ordem integer default 0,
  criado_em timestamp with time zone default now()
);

-- Create gift_contributions table
create table if not exists gift_contributions (
  id uuid default uuid_generate_v4() primary key,
  gift_id uuid references gifts(id) on delete cascade,
  rsvp_id uuid references rsvps(id) on delete set null,
  payment_id uuid references payments(id) on delete set null,
  valor numeric not null,
  mensagem text,
  anonimo boolean default false,
  criado_em timestamp with time zone default now()
);

-- Create gifts_received table (for tracking received gifts)
create table if not exists gifts_received (
  id uuid default uuid_generate_v4() primary key,
  product_id text,
  product_name text,
  guest_name text,
  amount numeric,
  date timestamp with time zone,
  payment_id uuid references payments(id) on delete set null,
  mensagem text,
  tipo text default 'gift' -- gift, gravata
);

-- Create indexes for better performance
create index if not exists idx_rsvps_criado_em on rsvps(criado_em desc);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_asaas_id on payments(asaas_payment_id);
create index if not exists idx_gift_contributions_gift_id on gift_contributions(gift_id);
create index if not exists idx_gift_contributions_rsvp_id on gift_contributions(rsvp_id);

-- Enable Row Level Security
alter table guests enable row level security;
alter table rsvps enable row level security;
alter table payments enable row level security;
alter table gifts enable row level security;
alter table gift_contributions enable row level security;
alter table companion_attendance enable row level security;
alter table gifts_received enable row level security;

-- Create policies for public access (adjust as needed for security)
create policy "Public read access for guests" on guests for select using (true);
create policy "Admin insert for guests" on guests for insert with check (true);
create policy "Admin update for guests" on guests for update using (true);
create policy "Admin delete for guests" on guests for delete using (true);

create policy "Public read access for RSVPs" on rsvps for select using (true);
create policy "Public insert for RSVPs" on rsvps for insert with check (true);
create policy "Public update for RSVPs" on rsvps for update using (true);

create policy "Public read access for payments" on payments for select using (true);
create policy "Public insert for payments" on payments for insert with check (true);
create policy "Public update for payments" on payments for update using (true);

create policy "Public read access for gifts" on gifts for select using (true);
create policy "Public read access for gift_contributions" on gift_contributions for select using (true);
create policy "Public insert for gift_contributions" on gift_contributions for insert with check (true);

create policy "Public read access for companion_attendance" on companion_attendance for select using (true);
create policy "Public insert for companion_attendance" on companion_attendance for insert with check (true);
create policy "Public update for companion_attendance" on companion_attendance for update using (true);

create policy "Public read access for gifts_received" on gifts_received for select using (true);
create policy "Public insert for gifts_received" on gifts_received for insert with check (true);

-- Insert sample gifts
insert into gifts (nome, descricao, valor, ordem) values
  ('Lua de Mel', 'Ajude-nos a realizar nosso sonho de lua de mel', 500.00, 1),
  ('Jantar Romântico', 'Um jantar especial para comemorar nosso amor', 300.00, 2),
  ('Decoração Casa Nova', 'Para tornar nosso lar ainda mais especial', 200.00, 3),
  ('Aparelho de Cozinha', 'Equipamentos para nossa nova vida juntos', 150.00, 4),
  ('Livros e Cultura', 'Investimento em nosso crescimento conjunto', 100.00, 5),
  ('Valor Livre', 'Escolha o valor que deseja contribuir', 50.00, 6)
on conflict do nothing;
