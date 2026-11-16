create or replace function private.notify_booking_status_changed()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 if new.status is distinct from old.status then
  if new.status::text in ('approved','rejected','assigned','in_progress','completed','cancelled') then
   if new.customer_user_id is not null then
    perform private.create_business_notification(new.business_id,new.branch_id,new.customer_user_id,'customer',new.id,'booking.'||new.status::text,'Booking '||replace(new.status::text,'_',' '),'Your rental booking status has been updated.',jsonb_build_object('booking_id',new.id,'status',new.status::text));
   end if;
   if new.status::text in ('approved','rejected','completed','cancelled') then
    perform private.create_business_notification(new.business_id,new.branch_id,null,'owner',new.id,'booking.'||new.status::text,'Booking '||replace(new.status::text,'_',' '),'A booking status has changed.',jsonb_build_object('booking_id',new.id,'status',new.status::text));
   end if;
  end if;
 end if;
 return new;
end;
$$;
revoke all on function private.notify_booking_status_changed() from public,anon,authenticated;
