revoke update(status) on public.rental_invoices from authenticated;
grant update(notes,due_at) on public.rental_invoices to authenticated;