create policy "service role only booking rate limits"
on public.public_booking_rate_limits
for all
to anon, authenticated
using (false)
with check (false);
