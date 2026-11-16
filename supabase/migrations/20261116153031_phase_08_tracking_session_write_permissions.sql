grant update(last_location_at,ended_at) on public.driver_tracking_sessions to authenticated;
drop policy "drivers stop own tracking sessions" on public.driver_tracking_sessions;
create policy "drivers update own tracking session timestamps" on public.driver_tracking_sessions for update to authenticated using(driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()) and ended_at is null) with check(driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()));
create or replace function public.start_driver_tracking(p_assignment_id uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_assignment record; v_session uuid;
begin
 if auth.uid() is null or private.current_app_role()<>'driver' then raise exception 'Not authorised' using errcode='42501'; end if;
 select a.id,a.business_id,a.machine_id,a.booking_id,b.branch_id into v_assignment from public.booking_assignments a join public.bookings b on b.id=a.booking_id and b.business_id=a.business_id where a.id=p_assignment_id and a.driver_user_id=auth.uid() and a.active=true and b.status='in_progress';
 if not found then raise exception 'Tracking is only available for your active in-progress assignment' using errcode='42501'; end if;
 if exists(select 1 from public.driver_tracking_sessions s where s.assignment_id=p_assignment_id and s.ended_at is null) then raise exception 'Tracking is already active for this assignment' using errcode='23505'; end if;
 insert into public.driver_tracking_sessions(business_id,branch_id,assignment_id,booking_id,machine_id,driver_user_id) values(v_assignment.business_id,v_assignment.branch_id,v_assignment.id,v_assignment.booking_id,v_assignment.machine_id,auth.uid()) returning id into v_session;
 return v_session;
end; $$;
revoke all on function public.start_driver_tracking(uuid) from public,anon;
grant execute on function public.start_driver_tracking(uuid) to authenticated;
