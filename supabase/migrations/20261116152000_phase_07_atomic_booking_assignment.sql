create or replace function public.assign_booking(
  p_booking_id uuid,
  p_machine_id uuid,
  p_driver_user_id uuid
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_assignment_id uuid;
begin
  if auth.uid() is null or private.current_app_role() not in ('owner','manager') then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  v_business_id := private.current_business_id();
  if v_business_id is null then
    raise exception 'Business profile missing' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.bookings b
    where b.id = p_booking_id and b.business_id = v_business_id
      and b.status in ('approved','assigned')
  ) then
    raise exception 'Booking is not assignable' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.machines m
    where m.id = p_machine_id and m.business_id = v_business_id
      and m.status = 'available'
  ) then
    raise exception 'Machine is not available for assignment' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = p_driver_user_id and p.business_id = v_business_id
      and p.role = 'driver' and p.is_active = true
  ) then
    raise exception 'Driver is not active in this business' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.booking_assignments a
    where a.booking_id = p_booking_id and a.active = true
  ) then
    raise exception 'Booking already has an active assignment' using errcode = '23505';
  end if;
  insert into public.booking_assignments(business_id,booking_id,machine_id,driver_user_id,assigned_by,active)
  values(v_business_id,p_booking_id,p_machine_id,p_driver_user_id,auth.uid(),true)
  returning id into v_assignment_id;
  update public.bookings set machine_id=p_machine_id,status='assigned'
  where id=p_booking_id and business_id=v_business_id;
  update public.machines set status='on_rent'
  where id=p_machine_id and business_id=v_business_id;
  return v_assignment_id;
end;
$$;
revoke all on function public.assign_booking(uuid,uuid,uuid) from public, anon;
grant execute on function public.assign_booking(uuid,uuid,uuid) to authenticated;
