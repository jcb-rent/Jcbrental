alter table public.bookings add column tracking_token_expires_at timestamptz;
create index bookings_tracking_token_expiry_idx on public.bookings(tracking_token_hash,tracking_token_expires_at) where tracking_token_hash is not null;
