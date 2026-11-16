create or replace function public.driver_set_booking_status(p_booking_id uuid,p_status public.booking_status)
returns void language plpgsql security invoker set search_path=''
as $$
declare v_machine_id uuid; v_assignment_id uuid;
begin
 if auth.uid() is null or private.current_app_role()<>'driver' then raise exception 'Not authorised' using errcode='42501'; end if;
 if p_status not in ('in_progress','completed') then raise exception 'Unsupported driver booking status' using errcode='22023'; end if;
 select a.machine_id,a.id into v_machine_id,v_assignment_id
 from public.booking_assignments a join public.bookings b on b.id=a.booking_id and b.business_id=a.business_id
 where a.booking_id=p_booking_id and a.driver_user_id=auth.uid() and a.active=true and b.status in ('approved','assigned','in_progress')
 for update of b;
 if v_machine_id is null then raise exception 'No active assignment for this booking' using errcode='42501'; end if;
 update public.bookings set status=p_status where id=p_booking_id;
 if p_status='completed' then
   update public.driver_tracking_sessions set ended_at=now() where assignment_id=v_assignment_id and ended_at is null;
   update public.booking_assignments set active=false where id=v_assignment_id;
   update public.machines set status='available' where id=v_machine_id;
 end if;
end;
$$;
revoke all on function public.driver_set_booking_status(uuid,public.booking_status) from public,anon;
grant execute on function public.driver_set_booking_status(uuid,public.booking_status) to authenticated;
