-- Run this in your Supabase project: SQL Editor → New Query → paste and run

create table listings (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title      text not null,
  price      numeric,
  image_url  text,
  etsy_url   text not null,
  tags       text[] default '{}',
  sold       boolean default false
);

-- Allow public read access (so the shop page can fetch listings)
alter table listings enable row level security;

create policy "Public can read active listings"
  on listings for select
  using (true);

create policy "Anyone can insert listings"
  on listings for insert
  with check (true);

create policy "Anyone can update listings"
  on listings for update
  using (true);

create policy "Anyone can delete listings"
  on listings for delete
  using (true);
