create or replace function public.create_booking_invoice(
 p_booking_id uuid,p_rental_amount numeric,p_transport_amount numeric default 0,p_operator_amount numeric default 0,
 p_diesel_amount numeric default 0,p_other_amount numeric default 0,p_discount_amount numeric default 0,p_tax_rate numeric default null,p_notes text default null
) returns uuid language plpgsql security invoker set search_path=''
as $$
declare v_booking public.bookings%rowtype;v_business public.businesses%rowtype;v_invoice_id uuid;v_invoice_number text;
 v_subtotal numeric(12,2);v_tax_rate numeric(5,2);v_taxable numeric(12,2);v_tax numeric(12,2);v_total numeric(12,2);v_next bigint;
begin
 if auth.uid() is null or not private.can_manage_business() then raise exception 'Not authorised' using errcode='42501';end if;
 if p_rental_amount is null or p_rental_amount<0 or coalesce(p_transport_amount,0)<0 or coalesce(p_operator_amount,0)<0 or coalesce(p_diesel_amount,0)<0 or coalesce(p_other_amount,0)<0 or coalesce(p_discount_amount,0)<0 then raise exception 'Amounts must be provided and cannot be negative' using errcode='22023';end if;
 select * into v_booking from public.bookings where id=p_booking_id and business_id=private.current_business_id() for update;
 if not found then raise exception 'Booking not found' using errcode='P0002';end if;
 if v_booking.status not in('approved','assigned','in_progress','completed') then raise exception 'Only approved, active or completed bookings can be invoiced' using errcode='22023';end if;
 if exists(select 1 from public.rental_invoices where booking_id=p_booking_id) then raise exception 'An invoice already exists for this booking' using errcode='23505';end if;
 select * into v_business from public.businesses where id=v_booking.business_id for update;
 v_tax_rate:=case when v_business.gst_enabled then coalesce(p_tax_rate,v_business.gst_rate) else 0 end;
 if v_tax_rate<0 or v_tax_rate>100 then raise exception 'Invalid tax rate' using errcode='22023';end if;
 v_subtotal:=round(p_rental_amount+coalesce(p_transport_amount,0)+coalesce(p_operator_amount,0)+coalesce(p_diesel_amount,0)+coalesce(p_other_amount,0),2);
 if v_subtotal<=0 then raise exception 'Invoice subtotal must be greater than zero' using errcode='22023';end if;
 if coalesce(p_discount_amount,0)>v_subtotal then raise exception 'Discount exceeds subtotal' using errcode='22023';end if;
 v_taxable:=v_subtotal-coalesce(p_discount_amount,0);v_tax:=round(v_taxable*v_tax_rate/100,2);v_total:=v_taxable+v_tax;
 select coalesce(max(regexp_replace(invoice_number,'^.*-','')::bigint),0)+1 into v_next from public.rental_invoices where business_id=v_business.id and invoice_number like v_business.invoice_prefix||'-%';
 v_invoice_number:=v_business.invoice_prefix||'-'||to_char(now(),'YYYY')||'-'||lpad(v_next::text,5,'0');
 insert into public.rental_invoices(business_id,branch_id,booking_id,invoice_number,customer_name,customer_mobile,billing_address,gstin_snapshot,gst_enabled_snapshot,tax_rate,subtotal,discount_amount,taxable_amount,tax_amount,total_amount,balance_amount,notes,created_by)
 values(v_booking.business_id,v_booking.branch_id,v_booking.id,v_invoice_number,v_booking.customer_name,v_booking.customer_mobile,v_booking.site_address,v_business.gstin,v_business.gst_enabled,v_tax_rate,v_subtotal,coalesce(p_discount_amount,0),v_taxable,v_tax,v_total,v_total,p_notes,auth.uid()) returning id into v_invoice_id;
 if p_rental_amount>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,quantity,unit,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Machine rental · '||v_booking.rental_unit,v_booking.quantity,v_booking.rental_unit,p_rental_amount/nullif(v_booking.quantity,0),p_rental_amount);end if;
 if coalesce(p_transport_amount,0)>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Transportation',p_transport_amount,p_transport_amount);end if;
 if coalesce(p_operator_amount,0)>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Operator charges',p_operator_amount,p_operator_amount);end if;
 if coalesce(p_diesel_amount,0)>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Diesel charges',p_diesel_amount,p_diesel_amount);end if;
 if coalesce(p_other_amount,0)>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Other charges',p_other_amount,p_other_amount);end if;
 return v_invoice_id;
end;$$;
revoke all on function public.create_booking_invoice(uuid,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) from public,anon;
grant execute on function public.create_booking_invoice(uuid,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) to authenticated;