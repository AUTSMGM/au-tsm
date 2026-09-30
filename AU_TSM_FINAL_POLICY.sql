-- AU TSM roster workflow final policy
-- Run in Supabase SQL Editor before uploading the website files.

-- Public raid-test victory: only Trial -> Raid Ready.
drop policy if exists "Public can pass raid ready test" on guild_rolls;

create policy "Public can pass raid ready test"
on guild_rolls
for update
to anon
using (
    guild_rank = 'Trial'
    and coalesce(application_status, 'None') = 'None'
    and roster_active = false
)
with check (
    guild_rank = 'Raid Ready'
    and coalesce(application_status, 'None') = 'None'
    and roster_active = false
);

-- Existing public application policy should already exist from the prior setup.
-- Recreate it here safely so the final workflow is explicit.
drop policy if exists "Public can submit raid applications" on guild_rolls;

create policy "Public can submit raid applications"
on guild_rolls
for update
to anon
using (
    guild_rank = 'Raid Ready'
    and coalesce(application_status, 'None') = 'None'
    and roster_active = false
)
with check (
    guild_rank = 'Raid Ready'
    and application_status = 'Pending'
    and roster_active = false
);
