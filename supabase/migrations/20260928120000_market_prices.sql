-- Market price tracking: car models plus one aggregated price snapshot per
-- model, source and day. Snapshots are written by the `refresh-prices` edge
-- function; the frontend only reads.

create table car_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

create table car_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references car_brands (id) on delete cascade,
  name text not null,
  variant text,
  year int not null,
  fuel_type text not null,
  body_type text not null,
  -- Provider search parameters. Models without them are skipped by that provider.
  search_query text,     -- eBay free-text query, defaults to "<brand> <name> <variant>"
  mobile_make_key text,  -- mobile.de refdata make key, e.g. 'AUDI'
  mobile_model_key text, -- mobile.de refdata model key, e.g. 'A4'
  created_at timestamptz not null default now()
);

create table price_snapshots (
  id uuid primary key default gen_random_uuid(),
  car_model_id uuid not null references car_models (id) on delete cascade,
  -- 'all' is the combined, outlier-filtered aggregate across every source.
  source text not null check (source in ('all', 'mobile_de', 'ebay')),
  avg_price int not null,
  median_price int not null,
  min_price int not null,
  max_price int not null,
  listing_count int not null,
  avg_mileage int,
  recorded_on date not null default current_date,
  recorded_at timestamptz not null default now(),
  unique (car_model_id, source, recorded_on)
);

create index price_snapshots_model_source_time_idx
  on price_snapshots (car_model_id, source, recorded_at desc);

alter table car_brands enable row level security;
alter table car_models enable row level security;
alter table price_snapshots enable row level security;

create policy "Public read" on car_brands for select to anon, authenticated using (true);
create policy "Public read" on car_models for select to anon, authenticated using (true);
create policy "Public read" on price_snapshots for select to anon, authenticated using (true);

-- One row per model with the latest combined price, the price ~30 days ago
-- and the last 30 days of prices for sparklines.
create view car_market_overview with (security_invoker = true) as
select
  m.id,
  b.name as brand,
  m.name,
  m.variant,
  m.year,
  m.fuel_type,
  m.body_type,
  latest.avg_price as current_price,
  latest.median_price,
  latest.min_price,
  latest.max_price,
  latest.listing_count,
  latest.recorded_at as price_updated_at,
  prev.avg_price as previous_price,
  coalesce(spark.prices, '{}') as sparkline
from car_models m
join car_brands b on b.id = m.brand_id
left join lateral (
  select * from price_snapshots s
  where s.car_model_id = m.id and s.source = 'all'
  order by s.recorded_at desc
  limit 1
) latest on true
left join lateral (
  select s.avg_price from price_snapshots s
  where s.car_model_id = m.id and s.source = 'all'
    and s.recorded_at <= now() - interval '30 days'
  order by s.recorded_at desc
  limit 1
) prev on true
left join lateral (
  select array_agg(s.avg_price order by s.recorded_at) as prices
  from price_snapshots s
  where s.car_model_id = m.id and s.source = 'all'
    and s.recorded_at > now() - interval '30 days'
) spark on true;

-- Seed the initial watchlist.
insert into car_brands (name) values
  ('BMW'), ('Mercedes-Benz'), ('Volkswagen'), ('Audi'), ('Porsche');

insert into car_models (brand_id, name, variant, year, fuel_type, body_type)
select b.id, v.name, v.variant, v.year, v.fuel_type, v.body_type
from (values
  ('BMW', '3er', '320d', 2021, 'Diesel', 'Limousine'),
  ('BMW', 'X5', 'xDrive40d', 2022, 'Diesel', 'SUV'),
  ('Mercedes-Benz', 'C-Klasse', 'C200', 2021, 'Benzin', 'Limousine'),
  ('Mercedes-Benz', 'E-Klasse', 'E300de', 2022, 'Hybrid', 'Limousine'),
  ('Volkswagen', 'Golf', 'GTI', 2023, 'Benzin', 'Kompakt'),
  ('Volkswagen', 'Tiguan', '2.0 TDI', 2022, 'Diesel', 'SUV'),
  ('Audi', 'A4', '40 TFSI', 2021, 'Benzin', 'Limousine'),
  ('Audi', 'Q5', '45 TFSI', 2022, 'Benzin', 'SUV'),
  ('Porsche', '911', 'Carrera', 2021, 'Benzin', 'Sportwagen'),
  ('Porsche', 'Cayenne', 'S', 2022, 'Benzin', 'SUV')
) as v (brand, name, variant, year, fuel_type, body_type)
join car_brands b on b.name = v.brand;
