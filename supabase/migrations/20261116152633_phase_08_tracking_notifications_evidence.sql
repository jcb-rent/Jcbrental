create table public.driver_tracking_sessions (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 branch_id uuid, assignment_id uuid not null references public.booking_assignments(id), booking_id uuid not null,
 machine_id uuid not null, driver_user_id uuid not null, started_at timestamptz not null default now(),
 ended_at timestamptz, last_location_at timestamptz, created_at timestamptz not null default now(),
 foreign key(branch_id,business_id) references public.branches(id,business_id),
 foreign key(booking_id,business_id) references public.bookings(id,business_id),
 foreign key(machine_id,business_id) references public.machines(id,business_id),
 foreign key(driver_user_id,business_id) references public.profiles(id,business_id),
 check(ended_at is null or ended_at>=started_at)
);
create unique index driver_tracking_one_active_per_assignment on public.driver_tracking_sessions(assignment_id) where ended_at is null;
create index driver_tracking_business_recent_idx on public.driver_tracking_sessions(business_id,started_at desc);
alter table public.driver_tracking_sessions enable row level security;
revoke all on public.driver_tracking_sessions from anon,public;
grant select on public.driver_tracking_sessions to authenticated;
create policy "staff read business tracking sessions" on public.driver_tracking_sessions for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "drivers read own tracking sessions" on public.driver_tracking_sessions for select to authenticated using(driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()));

create table public.machine_location_updates (
 id bigint generated always as identity primary key, business_id uuid not null, branch_id uuid,
 tracking_session_id uuid not null references public.driver_tracking_sessions(id) on delete cascade,
 assignment_id uuid not null references public.booking_assignments(id) on delete cascade, booking_id uuid not null,
 machine_id uuid not null, driver_user_id uuid not null, latitude double precision not null check(latitude between -90 and 90),
 longitude double precision not null check(longitude between -180 and 180),
 accuracy_m double precision check(accuracy_m is null or accuracy_m between 0 and 10000),
 speed_mps double precision check(speed_mps is null or speed_mps between 0 and 150),
 heading_deg double precision check(heading_deg is null or heading_deg between 0 and 360),
 captured_at timestamptz not null, received_at timestamptz not null default now(),
 foreign key(business_id) references public.businesses(id),
 foreign key(branch_id,business_id) references public.branches(id,business_id),
 foreign key(booking_id,business_id) references public.bookings(id,business_id),
 foreign key(machine_id,business_id) references public.machines(id,business_id),
 foreign key(driver_user_id,business_id) references public.profiles(id,business_id)
);
create index machine_location_session_recent_idx on public.machine_location_updates(tracking_session_id,captured_at desc);
create index machine_location_business_recent_idx on public.machine_location_updates(business_id,captured_at desc);
create index machine_location_booking_recent_idx on public.machine_location_updates(booking_id,captured_at desc);
alter table public.machine_location_updates enable row level security;
revoke all on public.machine_location_updates from anon,public;
grant select on public.machine_location_updates to authenticated;
create policy "staff read business machine locations" on public.machine_location_updates for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "drivers read own machine locations" on public.machine_location_updates for select to authenticated using(driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()));

create table public.notifications (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 branch_id uuid, recipient_user_id uuid references auth.users(id) on delete cascade,
 audience text not null check(audience in ('owner','manager','driver','customer')), booking_id uuid,
 event_type text not null,title text not null,body text not null,payload jsonb not null default '{}'::jsonb,
 read_at timestamptz,created_at timestamptz not null default now(),
 foreign key(branch_id,business_id) references public.branches(id,business_id),
 foreign key(booking_id,business_id) references public.bookings(id,business_id)
);
create index notifications_business_recent_idx on public.notifications(business_id,created_at desc);
create index notifications_recipient_recent_idx on public.notifications(recipient_user_id,created_at desc) where recipient_user_id is not null;
alter table public.notifications enable row level security;
revoke all on public.notifications from anon,public;
grant select,update(read_at) on public.notifications to authenticated;
create policy "staff read business notifications" on public.notifications for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()) and audience in ('owner','manager'));
create policy "drivers read own notifications" on public.notifications for select to authenticated using(recipient_user_id=(select auth.uid()) and business_id=(select private.current_business_id()));
create policy "staff mark own notifications read" on public.notifications for update to authenticated using((recipient_user_id=(select auth.uid()) and business_id=(select private.current_business_id())) or (business_id=(select private.current_business_id()) and (select private.can_manage_business()) and audience in ('owner','manager'))) with check(read_at is not null and ((recipient_user_id=(select auth.uid()) and business_id=(select private.current_business_id())) or (business_id=(select private.current_business_id()) and (select private.can_manage_business()) and audience in ('owner','manager'))));

create or replace function private.create_business_notification(p_business_id uuid,p_branch_id uuid,p_recipient uuid,p_audience text,p_booking_id uuid,p_event text,p_title text,p_body text,p_payload jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin insert into public.notifications(business_id,branch_id,recipient_user_id,audience,booking_id,event_type,title,body,payload)
values(p_business_id,p_branch_id,p_recipient,p_audience,p_booking_id,p_event,p_title,p_body,coalesce(p_payload,'{}'::jsonb)); end; $$;
revoke all on function private.create_business_notification(uuid,uuid,uuid,text,uuid,text,text,text,jsonb) from public,anon,authenticated;

create or replace function private.notify_booking_inserted() returns trigger language plpgsql security definer set search_path='' as $$
begin perform private.create_business_notification(new.business_id,new.branch_id,null,'owner',new.id,'booking.created','New booking request','A customer submitted a new machine rental request.',jsonb_build_object('booking_id',new.id)); return new; end; $$;
revoke all on function private.notify_booking_inserted() from public,anon,authenticated;
create trigger phase08_booking_created_notification after insert on public.bookings for each row execute function private.notify_booking_inserted();

create or replace function private.notify_booking_status_changed() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status is distinct from old.status then
  if new.status in ('approved','rejected','assigned','in_progress','completed','cancelled') then
   if new.customer_user_id is not null then perform private.create_business_notification(new.business_id,new.branch_id,new.customer_user_id,'customer',new.id,'booking.'||new.status,'Booking '||replace(new.status,'_',' '),'Your rental booking status has been updated.',jsonb_build_object('booking_id',new.id,'status',new.status)); end if;
   if new.status in ('approved','rejected','completed','cancelled') then perform private.create_business_notification(new.business_id,new.branch_id,null,'owner',new.id,'booking.'||new.status,'Booking '||replace(new.status,'_',' '),'A booking status has changed.',jsonb_build_object('booking_id',new.id,'status',new.status)); end if;
  end if;
 end if; return new;
end; $$;
revoke all on function private.notify_booking_status_changed() from public,anon,authenticated;
create trigger phase08_booking_status_notification after update of status on public.bookings for each row execute function private.notify_booking_status_changed();

create or replace function private.notify_assignment_created() returns trigger language plpgsql security definer set search_path='' as $$
begin perform private.create_business_notification(new.business_id,null,new.driver_user_id,'driver',new.booking_id,'assignment.created','New machine assigned','A machine and booking have been assigned to you.',jsonb_build_object('booking_id',new.booking_id,'machine_id',new.machine_id,'assignment_id',new.id)); return new; end; $$;
revoke all on function private.notify_assignment_created() from public,anon,authenticated;
create trigger phase08_assignment_created_notification after insert on public.booking_assignments for each row execute function private.notify_assignment_created();

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

create or replace function public.stop_driver_tracking(p_session_id uuid) returns void language plpgsql security invoker set search_path='' as $$
begin if auth.uid() is null or private.current_app_role()<>'driver' then raise exception 'Not authorised' using errcode='42501'; end if;
 update public.driver_tracking_sessions set ended_at=now() where id=p_session_id and driver_user_id=auth.uid() and ended_at is null;
 if not found then raise exception 'Active tracking session not found' using errcode='42501'; end if; end; $$;
revoke all on function public.stop_driver_tracking(uuid) from public,anon;
grant execute on function public.stop_driver_tracking(uuid) to authenticated;

create or replace function public.record_driver_location(p_session_id uuid,p_latitude double precision,p_longitude double precision,p_accuracy_m double precision default null,p_speed_mps double precision default null,p_heading_deg double precision default null,p_captured_at timestamptz default now())
returns bigint language plpgsql security invoker set search_path='' as $$
declare v_session record; v_location_id bigint;
begin
 if auth.uid() is null or private.current_app_role()<>'driver' then raise exception 'Not authorised' using errcode='42501'; end if;
 if p_captured_at>now()+interval '1 minute' or p_captured_at<now()-interval '5 minutes' then raise exception 'Location timestamp is outside the accepted window' using errcode='22023'; end if;
 select s.* into v_session from public.driver_tracking_sessions s join public.booking_assignments a on a.id=s.assignment_id and a.active=true and a.driver_user_id=auth.uid() join public.bookings b on b.id=s.booking_id and b.status='in_progress' where s.id=p_session_id and s.driver_user_id=auth.uid() and s.ended_at is null for update of s;
 if not found then raise exception 'No active tracking session for this driver' using errcode='42501'; end if;
 if v_session.last_location_at is not null and now()-v_session.last_location_at<interval '10 seconds' then raise exception 'Location updates are limited to one every 10 seconds' using errcode='22023'; end if;
 insert into public.machine_location_updates(business_id,branch_id,tracking_session_id,assignment_id,booking_id,machine_id,driver_user_id,latitude,longitude,accuracy_m,speed_mps,heading_deg,captured_at)
 values(v_session.business_id,v_session.branch_id,v_session.id,v_session.assignment_id,v_session.booking_id,v_session.machine_id,v_session.driver_user_id,p_latitude,p_longitude,p_accuracy_m,p_speed_mps,p_heading_deg,p_captured_at) returning id into v_location_id;
 update public.driver_tracking_sessions set last_location_at=now() where id=p_session_id;
 return v_location_id;
end; $$;
revoke all on function public.record_driver_location(uuid,double precision,double precision,double precision,double precision,double precision,timestamptz) from public,anon;
grant execute on function public.record_driver_location(uuid,double precision,double precision,double precision,double precision,double precision,timestamptz) to authenticated;

alter table public.notifications replica identity full;
alter table public.machine_location_updates replica identity full;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then alter publication supabase_realtime add table public.notifications; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='machine_location_updates') then alter publication supabase_realtime add table public.machine_location_updates; end if;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('machine-log-evidence','machine-log-evidence',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "drivers upload evidence to own business folder" on storage.objects for insert to authenticated with check(bucket_id='machine-log-evidence' and (storage.foldername(name))[1]=(select private.current_business_id())::text and (storage.foldername(name))[2]=(select auth.uid())::text and (select private.current_app_role())='driver' and exists(select 1 from public.booking_assignments a where a.driver_user_id=(select auth.uid()) and a.active=true and a.business_id=(select private.current_business_id())));
create policy "staff read business machine evidence" on storage.objects for select to authenticated using(bucket_id='machine-log-evidence' and (storage.foldername(name))[1]=(select private.current_business_id())::text and (select private.can_manage_business()));
create policy "drivers read own machine evidence" on storage.objects for select to authenticated using(bucket_id='machine-log-evidence' and (storage.foldername(name))[1]=(select private.current_business_id())::text and (storage.foldername(name))[2]=(select auth.uid())::text and (select private.current_app_role())='driver');
