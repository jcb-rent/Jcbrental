create policy "managers read business staff profiles"
on public.profiles
for select
to authenticated
using (
  business_id = (select private.current_business_id())
  and (select private.can_manage_business())
);
