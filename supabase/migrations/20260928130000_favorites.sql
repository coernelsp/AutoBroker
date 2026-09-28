-- Per-user favorite car models. Rows are only visible to and writable by their owner.

create table favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  car_model_id uuid not null references car_models (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, car_model_id)
);

alter table favorites enable row level security;

create policy "Users read own favorites" on favorites
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users add own favorites" on favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users remove own favorites" on favorites
  for delete to authenticated using ((select auth.uid()) = user_id);
