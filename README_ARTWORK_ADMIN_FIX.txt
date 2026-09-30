AU TSM - ARTWORK + GUILD TOOLS FIX

1. BEFORE uploading the website, run AU_TSM_ADMIN_POLICY_FIX.sql in Supabase SQL Editor.
   This fixes the authenticated Guild Tools read/update path using a SECURITY DEFINER
   is_guild_admin() helper. Existing applications are not changed.

2. Upload/replace the website files from this package to GitHub, preserving folders.

Changes:
- Fixed World of Warcraft Forever landscape used as a fixed main-page background.
- Added supplied Forever logo to the AU TSM header lockup.
- Preserved the dark/gold AU TSM theme with a dark overlay for readability.
- Fixed manual role button geometry: Tank / Healer / DPS are always equal fixed columns,
  including unavailable roles, and align with Body Type controls.
- Guild Tools now has better database error reporting plus a Refresh button.
- Admin SQL policies made robust for authenticated Phinky account.
- Existing pending applications remain intact.

After deployment:
- Hard refresh main site with Ctrl+F5.
- Log out/in to Guild Tools once after running the SQL policy fix.
