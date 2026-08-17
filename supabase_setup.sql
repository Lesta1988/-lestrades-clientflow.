-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  stage text not null default 'Enquirer' check (stage in ('Enquirer','Potential Client','Client')),
  source text not null default 'Public Link',
  campaign text,
  interest text,
  budget numeric default 0,
  timeline text,
  owner text default 'Sales Team',
  follow_up date,
  notes text,
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_phone_idx on public.leads(phone);
create index if not exists leads_stage_idx on public.leads(stage);
create index if not exists leads_follow_up_idx on public.leads(follow_up);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads
for each row execute procedure public.set_updated_at();

alter table public.leads enable row level security;

-- Public visitors can submit enquiries but cannot read the database.
drop policy if exists "public can submit leads" on public.leads;
create policy "public can submit leads"
on public.leads for insert
to anon
with check (
  stage = 'Enquirer'
  and consent = true
);

-- IMPORTANT:
-- The admin CRM should ultimately require authenticated staff.
-- For an initial controlled test, you can temporarily enable read/update/delete
-- for authenticated users after setting up Supabase Auth:
drop policy if exists "authenticated staff can read leads" on public.leads;
create policy "authenticated staff can read leads"
on public.leads for select
to authenticated
using (true);

drop policy if exists "authenticated staff can update leads" on public.leads;
create policy "authenticated staff can update leads"
on public.leads for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated staff can delete leads" on public.leads;
create policy "authenticated staff can delete leads"
on public.leads for delete
to authenticated
using (true);
