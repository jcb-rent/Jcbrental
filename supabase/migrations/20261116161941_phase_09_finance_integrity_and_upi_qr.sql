grant update(upi_id,upi_qr_path,gst_rate,invoice_prefix,gst_enabled,gstin,invoice_terms) on public.businesses to authenticated;
revoke update(amount_paid,balance_amount,status,updated_at) on public.rental_invoices from authenticated;
revoke update(payment_status) on public.bookings from authenticated;
revoke insert,update,delete on public.rental_payments from authenticated;grant insert on public.rental_payments to authenticated;
drop policy "managers create business payments" on public.rental_payments;
create policy "managers create business payments" on public.rental_payments for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()) and received_by=(select auth.uid()) and status='confirmed');
create or replace function private.apply_rental_payment() returns trigger language plpgsql security definer set search_path='' as $$
declare v_invoice public.rental_invoices%rowtype;
begin
 select * into v_invoice from public.rental_invoices where id=new.invoice_id and business_id=new.business_id for update;
 if not found or v_invoice.status='void' then raise exception 'Invoice not found or void' using errcode='P0002';end if;
 if new.amount>v_invoice.balance_amount then raise exception 'Payment exceeds outstanding invoice balance' using errcode='22023';end if;
 update public.rental_invoices set amount_paid=amount_paid+new.amount,balance_amount=balance_amount-new.amount,status=case when balance_amount-new.amount<=0 then 'paid' else 'partially_paid' end,updated_at=now() where id=v_invoice.id;
 update public.bookings set payment_status=(case when v_invoice.amount_paid+new.amount>=v_invoice.total_amount then 'paid' when v_invoice.amount_paid+new.amount>0 then 'partially_paid' else 'unpaid' end)::public.payment_status where id=v_invoice.booking_id;
 return new;end;$$;
revoke all on function private.apply_rental_payment() from public,anon,authenticated;
create trigger rental_payment_apply after insert on public.rental_payments for each row execute function private.apply_rental_payment();
create or replace function public.record_invoice_payment(p_invoice_id uuid,p_amount numeric,p_method text,p_reference text default null,p_notes text default null)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_invoice public.rental_invoices%rowtype;v_payment_id uuid;
begin
 if auth.uid() is null or not private.can_manage_business() then raise exception 'Not authorised' using errcode='42501';end if;
 if p_amount<=0 or p_method not in('cash','upi') then raise exception 'Enter a positive amount and choose Cash or UPI' using errcode='22023';end if;
 select * into v_invoice from public.rental_invoices where id=p_invoice_id and business_id=private.current_business_id() for update;
 if not found or v_invoice.status='void' then raise exception 'Invoice not found or void' using errcode='P0002';end if;
 if p_amount>v_invoice.balance_amount then raise exception 'Payment cannot exceed the outstanding balance' using errcode='22023';end if;
 insert into public.rental_payments(business_id,branch_id,invoice_id,booking_id,amount,method,payment_reference,received_by,notes) values(v_invoice.business_id,v_invoice.branch_id,v_invoice.id,v_invoice.booking_id,p_amount,p_method,nullif(trim(p_reference),''),auth.uid(),p_notes) returning id into v_payment_id;
 return v_payment_id;end;$$;
revoke all on function public.record_invoice_payment(uuid,numeric,text,text,text) from public,anon;grant execute on function public.record_invoice_payment(uuid,numeric,text,text,text) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('business-payment-qr','business-payment-qr',true,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "owners upload business UPI QR" on storage.objects for insert to authenticated with check(bucket_id='business-payment-qr' and (storage.foldername(name))[1]=(select private.current_business_id())::text and (select private.can_manage_business()));
create policy "owners update business UPI QR" on storage.objects for update to authenticated using(bucket_id='business-payment-qr' and (storage.foldername(name))[1]=(select private.current_business_id())::text and (select private.can_manage_business())) with check(bucket_id='business-payment-qr' and (storage.foldername(name))[1]=(select private.current_business_id())::text and (select private.can_manage_business()));
create policy "owners delete business UPI QR" on storage.objects for delete to authenticated using(bucket_id='business-payment-qr' and (storage.foldername(name))[1]=(select private.current_business_id())::text and (select private.can_manage_business()));