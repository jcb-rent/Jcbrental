-- Consolidate permissive policies so each operation evaluates one role policy.
drop policy if exists "staff read business branches" on public.branches;
drop policy if exists "managers manage branches" on public.branches;
create policy "staff read business branches" on public.branches for select to authenticated using(business_id=(select private.current_business_id()) and (select private.is_staff()));
create policy "managers insert branches" on public.branches for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers update branches" on public.branches for update to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers delete branches" on public.branches for delete to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));

drop policy if exists "staff read own business bookings" on public.bookings;
drop policy if exists "customers read own bookings" on public.bookings;
drop policy if exists "customers create own bookings" on public.bookings;
drop policy if exists "managers create bookings" on public.bookings;
drop policy if exists "managers update bookings" on public.bookings;
drop policy if exists "drivers update assigned booking status" on public.bookings;
create policy "users read own or business bookings" on public.bookings for select to authenticated using((customer_user_id=(select auth.uid())) or (business_id=(select private.current_business_id()) and (select private.is_staff())));
create policy "customers or managers create bookings" on public.bookings for insert to authenticated with check((customer_user_id=(select auth.uid()) and status='pending' and payment_status='unpaid') or (business_id=(select private.current_business_id()) and (select private.can_manage_business())));
create policy "managers or assigned drivers update bookings" on public.bookings for update to authenticated using((business_id=(select private.current_business_id()) and (select private.can_manage_business())) or ((select private.is_assigned_driver(id)) and status in ('approved','assigned','in_progress','completed'))) with check((business_id=(select private.current_business_id()) and (select private.can_manage_business())) or ((select private.is_assigned_driver(id)) and status in ('in_progress','completed')));

drop policy if exists "staff read assignments" on public.booking_assignments;
drop policy if exists "managers manage assignments" on public.booking_assignments;
drop policy if exists "drivers read own assignments" on public.booking_assignments;
create policy "staff or assigned driver read assignments" on public.booking_assignments for select to authenticated using((business_id=(select private.current_business_id()) and (select private.is_staff())) or (driver_user_id=(select auth.uid()) and active));
create policy "managers insert assignments" on public.booking_assignments for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers update assignments" on public.booking_assignments for update to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers delete assignments" on public.booking_assignments for delete to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));

drop policy if exists "staff read attendance" on public.driver_attendance;
drop policy if exists "drivers read own attendance" on public.driver_attendance;
create policy "staff or drivers read attendance" on public.driver_attendance for select to authenticated using((business_id=(select private.current_business_id()) and (select private.can_manage_business())) or driver_user_id=(select auth.uid()));

drop policy if exists "staff read machine logs" on public.machine_logs;
drop policy if exists "drivers add own machine logs" on public.machine_logs;
drop policy if exists "managers manage machine logs" on public.machine_logs;
create policy "staff read machine logs" on public.machine_logs for select to authenticated using(business_id=(select private.current_business_id()) and (select private.is_staff()));
create policy "drivers or managers add machine logs" on public.machine_logs for insert to authenticated with check((driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()) and (select private.current_app_role())='driver') or (business_id=(select private.current_business_id()) and (select private.can_manage_business())));
create policy "managers update machine logs" on public.machine_logs for update to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers delete machine logs" on public.machine_logs for delete to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));

create index if not exists bookings_machine_business_fk_idx on public.bookings(machine_id,business_id);
create index if not exists attendance_driver_business_fk_idx on public.driver_attendance(driver_user_id,business_id);
create index if not exists logs_booking_business_fk_idx on public.machine_logs(booking_id,business_id);
create index if not exists logs_driver_business_fk_idx on public.machine_logs(driver_user_id,business_id);
create index if not exists logs_machine_business_fk_idx on public.machine_logs(machine_id,business_id);
