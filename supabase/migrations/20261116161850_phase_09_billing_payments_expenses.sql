alter table public.businesses add column if not exists upi_id text,add column if not exists upi_qr_path text,add column if not exists gst_rate numeric(5,2) not null default 0,add column if not exists invoice_prefix text not null default 'JCB',add column if not exists invoice_terms text;
alter table public.businesses add constraint businesses_gst_rate_range check(gst_rate between 0 and 100),add constraint businesses_invoice_prefix_valid check(invoice_prefix ~ '^[A-Z0-9-]{1,12}$');
create table public.rental_invoices(
 id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,branch_id uuid,booking_id uuid not null,invoice_number text not null,
 status text not null default 'issued' check(status in('issued','partially_paid','paid','void')),currency text not null default 'INR' check(currency='INR'),
 customer_name text not null,customer_mobile text not null,billing_address text not null,gstin_snapshot text,gst_enabled_snapshot boolean not null default false,
 tax_rate numeric(5,2) not null default 0 check(tax_rate between 0 and 100),subtotal numeric(12,2) not null check(subtotal>=0),
 discount_amount numeric(12,2) not null default 0 check(discount_amount>=0),taxable_amount numeric(12,2) not null check(taxable_amount>=0),
 tax_amount numeric(12,2) not null default 0 check(tax_amount>=0),total_amount numeric(12,2) not null check(total_amount>=0),
 amount_paid numeric(12,2) not null default 0 check(amount_paid>=0),balance_amount numeric(12,2) not null check(balance_amount>=0),
 notes text,issued_at timestamptz not null default now(),due_at timestamptz,created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(branch_id,business_id) references public.branches(id,business_id),foreign key(booking_id,business_id) references public.bookings(id,business_id),
 unique(business_id,invoice_number),unique(booking_id),unique(id,business_id));
create index rental_invoices_business_date_idx on public.rental_invoices(business_id,issued_at desc);
create index rental_invoices_branch_date_idx on public.rental_invoices(branch_id,issued_at desc);
create table public.rental_invoice_items(
 id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,invoice_id uuid not null,
 description text not null,quantity numeric(10,2) not null default 1 check(quantity>0),unit text not null default 'service',
 unit_price numeric(12,2) not null check(unit_price>=0),line_total numeric(12,2) not null check(line_total>=0),created_at timestamptz not null default now(),
 foreign key(invoice_id,business_id) references public.rental_invoices(id,business_id));
create index rental_invoice_items_invoice_idx on public.rental_invoice_items(invoice_id);
create table public.rental_payments(
 id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,branch_id uuid,invoice_id uuid not null,booking_id uuid not null,
 amount numeric(12,2) not null check(amount>0),method text not null check(method in('cash','upi')),payment_reference text,
 status text not null default 'confirmed' check(status in('confirmed','reversed')),received_by uuid not null references auth.users(id),
 received_at timestamptz not null default now(),notes text,foreign key(branch_id,business_id) references public.branches(id,business_id),
 foreign key(invoice_id,business_id) references public.rental_invoices(id,business_id),foreign key(booking_id,business_id) references public.bookings(id,business_id));
create index rental_payments_business_date_idx on public.rental_payments(business_id,received_at desc);
create index rental_payments_invoice_idx on public.rental_payments(invoice_id,received_at desc);
create table public.business_expenses(
 id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,branch_id uuid,machine_id uuid,booking_id uuid,
 category text not null check(category in('diesel','maintenance','driver_salary','transport','repair','parts','other')),
 amount numeric(12,2) not null check(amount>0),expense_date date not null default current_date,vendor text,
 payment_method text not null default 'cash' check(payment_method in('cash','upi','bank')),reference text,description text not null,evidence_path text,
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 foreign key(branch_id,business_id) references public.branches(id,business_id),foreign key(machine_id,business_id) references public.machines(id,business_id),
 foreign key(booking_id,business_id) references public.bookings(id,business_id));
create index business_expenses_business_date_idx on public.business_expenses(business_id,expense_date desc);
create index business_expenses_machine_date_idx on public.business_expenses(machine_id,expense_date desc);
alter table public.rental_invoices enable row level security;alter table public.rental_invoice_items enable row level security;alter table public.rental_payments enable row level security;alter table public.business_expenses enable row level security;
revoke all on public.rental_invoices,public.rental_invoice_items,public.rental_payments,public.business_expenses from anon,public;
grant select,insert on public.rental_invoices,public.rental_invoice_items,public.rental_payments,public.business_expenses to authenticated;
grant update(status,notes,due_at) on public.rental_invoices to authenticated;
grant update(description,vendor,reference,expense_date,category,amount,payment_method,evidence_path) on public.business_expenses to authenticated;grant delete on public.business_expenses to authenticated;
create policy "managers read business invoices" on public.rental_invoices for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers create business invoices" on public.rental_invoices for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()) and created_by=(select auth.uid()));
create policy "managers update business invoices" on public.rental_invoices for update to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers read business invoice items" on public.rental_invoice_items for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers create business invoice items" on public.rental_invoice_items for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()) and exists(select 1 from public.rental_invoices i where i.id=invoice_id and i.business_id=rental_invoice_items.business_id));
create policy "managers read business payments" on public.rental_payments for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers create business payments" on public.rental_payments for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()) and received_by=(select auth.uid()));
create policy "managers read business expenses" on public.business_expenses for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers create business expenses" on public.business_expenses for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()) and created_by=(select auth.uid()));
create policy "managers update business expenses" on public.business_expenses for update to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers delete business expenses" on public.business_expenses for delete to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create or replace function public.create_booking_invoice(p_booking_id uuid,p_rental_amount numeric,p_transport_amount numeric default 0,p_operator_amount numeric default 0,p_diesel_amount numeric default 0,p_other_amount numeric default 0,p_discount_amount numeric default 0,p_tax_rate numeric default null,p_notes text default null)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_booking public.bookings%rowtype;v_business public.businesses%rowtype;v_invoice_id uuid;v_invoice_number text;v_subtotal numeric(12,2);v_tax_rate numeric(5,2);v_taxable numeric(12,2);v_tax numeric(12,2);v_total numeric(12,2);v_next bigint;
begin
 if auth.uid() is null or not private.can_manage_business() then raise exception 'Not authorised' using errcode='42501';end if;
 if p_rental_amount<0 or p_transport_amount<0 or p_operator_amount<0 or p_diesel_amount<0 or p_other_amount<0 or p_discount_amount<0 then raise exception 'Amounts cannot be negative' using errcode='22023';end if;
 select * into v_booking from public.bookings where id=p_booking_id and business_id=private.current_business_id() for update;
 if not found then raise exception 'Booking not found' using errcode='P0002';end if;
 if v_booking.status not in('approved','assigned','in_progress','completed') then raise exception 'Booking cannot be invoiced in this status' using errcode='22023';end if;
 if exists(select 1 from public.rental_invoices where booking_id=p_booking_id) then raise exception 'An invoice already exists for this booking' using errcode='23505';end if;
 select * into v_business from public.businesses where id=v_booking.business_id for update;
 v_tax_rate:=case when v_business.gst_enabled then coalesce(p_tax_rate,v_business.gst_rate) else 0 end;
 if v_tax_rate<0 or v_tax_rate>100 then raise exception 'Invalid tax rate' using errcode='22023';end if;
 v_subtotal:=round(p_rental_amount+p_transport_amount+p_operator_amount+p_diesel_amount+p_other_amount,2);
 if p_discount_amount>v_subtotal then raise exception 'Discount exceeds subtotal' using errcode='22023';end if;
 v_taxable:=v_subtotal-p_discount_amount;v_tax:=round(v_taxable*v_tax_rate/100,2);v_total:=v_taxable+v_tax;
 select coalesce(max(split_part(invoice_number,'-',3)::bigint),0)+1 into v_next from public.rental_invoices where business_id=v_business.id and invoice_number like v_business.invoice_prefix||'-%';
 v_invoice_number:=v_business.invoice_prefix||'-'||to_char(now(),'YYYY')||'-'||lpad(v_next::text,5,'0');
 insert into public.rental_invoices(business_id,branch_id,booking_id,invoice_number,customer_name,customer_mobile,billing_address,gstin_snapshot,gst_enabled_snapshot,tax_rate,subtotal,discount_amount,taxable_amount,tax_amount,total_amount,balance_amount,notes,created_by)
 values(v_booking.business_id,v_booking.branch_id,v_booking.id,v_invoice_number,v_booking.customer_name,v_booking.customer_mobile,v_booking.site_address,v_business.gstin,v_business.gst_enabled,v_tax_rate,v_subtotal,p_discount_amount,v_taxable,v_tax,v_total,v_total,p_notes,auth.uid()) returning id into v_invoice_id;
 if p_rental_amount>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,quantity,unit,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Machine rental · '||v_booking.rental_unit,v_booking.quantity,v_booking.rental_unit,p_rental_amount/nullif(v_booking.quantity,0),p_rental_amount);end if;
 if p_transport_amount>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Transportation',p_transport_amount,p_transport_amount);end if;
 if p_operator_amount>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Operator charges',p_operator_amount,p_operator_amount);end if;
 if p_diesel_amount>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Diesel charges',p_diesel_amount,p_diesel_amount);end if;
 if p_other_amount>0 then insert into public.rental_invoice_items(business_id,invoice_id,description,unit_price,line_total) values(v_booking.business_id,v_invoice_id,'Other charges',p_other_amount,p_other_amount);end if;
 return v_invoice_id;end;$$;
revoke all on function public.create_booking_invoice(uuid,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) from public,anon;grant execute on function public.create_booking_invoice(uuid,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) to authenticated;
create or replace function public.record_invoice_payment(p_invoice_id uuid,p_amount numeric,p_method text,p_reference text default null,p_notes text default null)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_invoice public.rental_invoices%rowtype;v_payment_id uuid;
begin
 if auth.uid() is null or not private.can_manage_business() then raise exception 'Not authorised' using errcode='42501';end if;
 if p_amount<=0 or p_method not in('cash','upi') then raise exception 'Invalid payment amount or method' using errcode='22023';end if;
 select * into v_invoice from public.rental_invoices where id=p_invoice_id and business_id=private.current_business_id() for update;
 if not found or v_invoice.status='void' then raise exception 'Invoice not found or void' using errcode='P0002';end if;
 if p_amount>v_invoice.balance_amount then raise exception 'Payment exceeds outstanding balance' using errcode='22023';end if;
 insert into public.rental_payments(business_id,branch_id,invoice_id,booking_id,amount,method,payment_reference,received_by,notes) values(v_invoice.business_id,v_invoice.branch_id,v_invoice.id,v_invoice.booking_id,p_amount,p_method,nullif(trim(p_reference),''),auth.uid(),p_notes) returning id into v_payment_id;
 return v_payment_id;end;$$;
revoke all on function public.record_invoice_payment(uuid,numeric,text,text,text) from public,anon;grant execute on function public.record_invoice_payment(uuid,numeric,text,text,text) to authenticated;