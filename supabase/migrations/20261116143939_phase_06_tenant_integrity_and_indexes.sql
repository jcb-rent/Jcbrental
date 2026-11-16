alter table public.bookings add constraint bookings_id_business_unique unique(id,business_id);
alter table public.machines add constraint machines_id_business_unique unique(id,business_id);
alter table public.profiles add constraint profiles_id_business_unique unique(id,business_id);
alter table public.booking_assignments
 add constraint assignments_booking_business_fk foreign key(booking_id,business_id) references public.bookings(id,business_id) on delete cascade,
 add constraint assignments_machine_business_fk foreign key(machine_id,business_id) references public.machines(id,business_id) on delete restrict,
 add constraint assignments_driver_business_fk foreign key(driver_user_id,business_id) references public.profiles(id,business_id) on delete restrict,
 add constraint assignments_assigner_business_fk foreign key(assigned_by,business_id) references public.profiles(id,business_id) on delete restrict;
create index profiles_business_role_idx on public.profiles(business_id,role) where business_id is not null;
create index branches_business_id_idx on public.branches(business_id);
create index bookings_branch_business_idx on public.bookings(branch_id,business_id);
create index bookings_customer_user_idx on public.bookings(customer_user_id) where customer_user_id is not null;
create index assignments_booking_id_idx on public.booking_assignments(booking_id);
create index assignments_business_id_idx on public.booking_assignments(business_id);
create index assignments_machine_id_idx on public.booking_assignments(machine_id);
create index assignments_assigned_by_idx on public.booking_assignments(assigned_by);
create index attendance_business_idx on public.driver_attendance(business_id);
create index attendance_branch_business_idx on public.driver_attendance(branch_id,business_id);
create index logs_booking_id_idx on public.machine_logs(booking_id) where booking_id is not null;
create index logs_driver_user_idx on public.machine_logs(driver_user_id);
create index logs_machine_id_idx on public.machine_logs(machine_id);
create or replace function private.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function private.set_updated_at() from public,anon,authenticated;
create trigger businesses_set_updated_at before update on public.businesses for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger machines_set_updated_at before update on public.machines for each row execute function private.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute function private.set_updated_at();