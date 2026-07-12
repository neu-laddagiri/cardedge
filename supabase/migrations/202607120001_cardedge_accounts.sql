create extension if not exists pgcrypto;

create table if not exists public.game_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null check (game_type in ('poker', 'blackjack')),
  played_at timestamptz not null,
  buy_in_cents integer not null check (buy_in_cents >= 0),
  cash_out_cents integer not null check (cash_out_cents >= 0),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_sessions_user_played_at_idx
  on public.game_sessions (user_id, played_at desc);

create table if not exists public.training_records (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type text not null check (record_type in ('poker_hand', 'blackjack_session')),
  saved_at timestamptz not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, record_type, id)
);

create index if not exists training_records_user_saved_at_idx
  on public.training_records (user_id, saved_at desc);

alter table public.game_sessions enable row level security;
alter table public.training_records enable row level security;

drop policy if exists "Users manage their own game sessions" on public.game_sessions;
create policy "Users manage their own game sessions"
  on public.game_sessions for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own training records" on public.training_records;
create policy "Users manage their own training records"
  on public.training_records for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.game_sessions to authenticated;
grant select, insert, update, delete on public.training_records to authenticated;
