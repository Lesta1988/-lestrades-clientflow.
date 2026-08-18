grant select, insert, update, delete on table public.leads to authenticated;

drop policy if exists "authenticated staff can insert leads" on public.leads;
create policy "authenticated staff can insert leads"
on public.leads for insert
to authenticated
with check (true);
