-- =========================================================
-- AU TSM GUILD TOOLS - ADMIN READ/UPDATE POLICY FIX
-- Run this once in Supabase SQL Editor.
-- It does not delete or alter character/application data.
-- =========================================================

-- Stable helper that checks guild_admins without causing RLS-policy recursion.
create or replace function public.is_guild_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.guild_admins
        where user_id = auth.uid()
    );
$$;

revoke all on function public.is_guild_admin() from public;
grant execute on function public.is_guild_admin() to authenticated;

-- The logged-in admin must be able to verify their own admin record.
drop policy if exists "Guild admins can read admin list" on public.guild_admins;
create policy "Guild admins can read admin list"
on public.guild_admins
for select
to authenticated
using (user_id = auth.uid());

-- Authenticated guild admin can read applications and roster rows.
drop policy if exists "Guild admins can read guild rolls" on public.guild_rolls;
create policy "Guild admins can read guild rolls"
on public.guild_rolls
for select
to authenticated
using (public.is_guild_admin());

-- Authenticated guild admin can approve/reject/remove roster members.
drop policy if exists "Guild admins can manage roster" on public.guild_rolls;
create policy "Guild admins can manage roster"
on public.guild_rolls
for update
to authenticated
using (public.is_guild_admin())
with check (public.is_guild_admin());
