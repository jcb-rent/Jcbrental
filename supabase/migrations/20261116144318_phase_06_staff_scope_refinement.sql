drop policy if exists "users read own profile" on public.profiles;
create policy "users or managers read profiles" on public.profiles for select to authenticated
using(id=(select auth.uid()) or (business_id=(select private.current_business_id()) and (select private.can_manage_business())));
drop policy if exists "users read own or business bookings" on public.bookings;
create policy "customers managers or assigned drivers read bookings" on public.bookings for select to authenticated
using(customer_user_id=(select auth.uid()) or (business_id=(select private.current_business_id()) and (select private.can_manage_business())) or (select private.is_assigned_driver(id)));
drop policy if exists "staff read machine logs" on public.machine_logs;
create policy "managers or own driver logs read" on public.machine_logs for select to authenticated
using((business_id=(select private.current_business_id()) and (select private.can_manage_business())) or (driver_user_id=(select auth.uid()) and (select private.current_app_role())='driver'));
