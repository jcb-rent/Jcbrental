create index assignments_assigner_business_idx on public.booking_assignments(assigned_by,business_id);
create index assignments_booking_business_idx on public.booking_assignments(booking_id,business_id);
create index assignments_driver_business_idx on public.booking_assignments(driver_user_id,business_id);
create index assignments_machine_business_idx on public.booking_assignments(machine_id,business_id);
create index machines_branch_business_fk_idx on public.machines(branch_id,business_id) where branch_id is not null;
create index profiles_branch_business_fk_idx on public.profiles(branch_id,business_id) where branch_id is not null;