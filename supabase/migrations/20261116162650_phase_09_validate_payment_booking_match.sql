create or replace function private.apply_rental_payment()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_invoice public.rental_invoices%rowtype;
begin
 select * into v_invoice from public.rental_invoices where id=new.invoice_id and business_id=new.business_id for update;
 if not found or v_invoice.status='void' then raise exception 'Invoice not found or void' using errcode='P0002';end if;
 if new.booking_id<>v_invoice.booking_id or new.branch_id is distinct from v_invoice.branch_id then
  raise exception 'Payment booking and branch must match the invoice' using errcode='23514';
 end if;
 if new.amount>v_invoice.balance_amount then raise exception 'Payment exceeds outstanding invoice balance' using errcode='22023';end if;
 update public.rental_invoices set amount_paid=amount_paid+new.amount,balance_amount=balance_amount-new.amount,
 status=case when balance_amount-new.amount<=0 then 'paid' else 'partially_paid' end,updated_at=now() where id=v_invoice.id;
 update public.bookings set payment_status=(case when v_invoice.amount_paid+new.amount>=v_invoice.total_amount then 'paid' when v_invoice.amount_paid+new.amount>0 then 'partially_paid' else 'unpaid' end)::public.payment_status where id=v_invoice.booking_id;
 return new;
end;$$;
revoke all on function private.apply_rental_payment() from public,anon,authenticated;