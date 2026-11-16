create policy "drivers release own completed machines"
on public.machines
for update
to authenticated
using (
  business_id = (select private.current_business_id())
  and exists (
    select 1 from public.booking_assignments a
    where a.machine_id = machines.id
      and a.driver_user_id = (select auth.uid())
      and a.active = true
  )
)
with check (
  business_id = (select private.current_business_id())
  and status = 'available'
  and exists (
    select 1
    from public.booking_assignments a
    join public.bookings b on b.id = a.booking_id and b.business_id = a.business_id
    where a.machine_id = machines.id
      and a.driver_user_id = (select auth.uid())
      and a.active = true
      and b.status = 'completed'
  )
);
grant update(status) on public.machines to authenticated;

create or replace function public.driver_set_booking_status(
  p_booking_id uuid,
  p_status public.booking_status
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_machine_id uuid;
begin
  if auth.uid() is null or private.current_app_role() <> 'driver' then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if p_status not in ('in_progress','completed') then
    raise exception 'Unsupported driver booking status' using errcode = '22023';
  end if;
  select a.machine_id into v_machine_id
  from public.booking_assignments a
  join public.bookings b on b.id = a.booking_id and b.business_id = a.business_id
  where a.booking_id = p_booking_id
    and a.driver_user_id = auth.uid()
    and a.active = true
    and b.status in ('approved','assigned','in_progress')
  for update of b;
  if v_machine_id is null then
    raise exception 'No active assignment for this booking' using errcode = '42501';
  end if;
  update public.bookings set status = p_status
  where id = p_booking_id;
  if p_status = 'completed' then
    update public.machines set status = 'available'
    where id = v_machine_id;
  end if;
end;
$$;
revoke all on function public.driver_set_booking_status(uuid,public.booking_status) from public, anon;
grant execute on function public.driver_set_booking_status(uuid,public.booking_status) to authenticated;
