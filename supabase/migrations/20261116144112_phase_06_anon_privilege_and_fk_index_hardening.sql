revoke all privileges on all tables in schema public from anon;
create index bookings_machine_business_fk_idx on public.bookings(machine_id,business_id) where machine_id is not null;
create index attendance_driver_business_fk_idx on public.driver_attendance(driver_user_id,business_id);
create index logs_booking_business_fk_idx on public.machine_logs(booking_id,business_id) where booking_id is not null;
create index logs_driver_business_fk_idx on public.machine_logs(driver_user_id,business_id);
create index logs_machine_business_fk_idx on public.machine_logs(machine_id,business_id);