alter table public.bookings add constraint bookings_machine_business_fk foreign key(machine_id,business_id) references public.machines(id,business_id) on delete restrict;
alter table public.driver_attendance add constraint attendance_driver_business_fk foreign key(driver_user_id,business_id) references public.profiles(id,business_id) on delete restrict;
alter table public.machine_logs
 add constraint logs_machine_business_fk foreign key(machine_id,business_id) references public.machines(id,business_id) on delete restrict,
 add constraint logs_driver_business_fk foreign key(driver_user_id,business_id) references public.profiles(id,business_id) on delete restrict,
 add constraint logs_booking_business_fk foreign key(booking_id,business_id) references public.bookings(id,business_id) on delete set null;
revoke update on public.profiles from authenticated;
grant update(full_name,phone) on public.profiles to authenticated;
revoke insert,update on public.driver_attendance from authenticated;
grant insert(business_id,branch_id,driver_user_id,check_in_note) on public.driver_attendance to authenticated;
grant update(check_out_at,check_out_note) on public.driver_attendance to authenticated;
revoke update on public.bookings from authenticated;
revoke insert,update,delete on public.booking_assignments from authenticated;
grant insert,update,delete on public.booking_assignments to authenticated;
revoke update,delete on public.machine_logs from authenticated;
revoke insert on public.machine_logs from authenticated;
grant insert(business_id,booking_id,machine_id,driver_user_id,log_type,quantity,unit,meter_reading,details,evidence_path,occurred_at) on public.machine_logs to authenticated;