grant update(amount_paid,balance_amount,status,updated_at) on public.rental_invoices to authenticated;
grant update(payment_status) on public.bookings to authenticated;