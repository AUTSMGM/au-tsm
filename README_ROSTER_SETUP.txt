AU TSM OFFICIAL ROSTER SYSTEM

WHAT THIS VERSION DOES
----------------------
Character progression:
Trial -> defeat Onyxia -> Raid Ready -> Submit for Raid Spot -> Pending
-> Phinky approves -> Raider / official roster

New public page:
roster.html
- Only approved rows where roster_active=true and guild_rank=Raider
- Summary counts for Raiders / Tanks / DPS / Healers
- Discord-signup-inspired grouping by role and class

New private page:
admin.html
- Supabase email/password login
- Verifies the logged-in user exists in guild_admins
- Pending applications: Approve / Reject
- Current Raiders: Remove from roster
- Removing never deletes character history

IMPORTANT BEFORE UPLOAD
-----------------------
1. Supabase -> SQL Editor -> New Query
2. Run AU_TSM_FINAL_POLICY.sql
3. It should report success.

UPLOAD TO GITHUB
----------------
This ZIP is based directly on the GitHub ZIP you uploaded.

Easiest method:
1. Extract AU_TSM_official_roster.zip.
2. In GitHub repo `au-tsm`, upload/replace the matching files.
3. Make sure the `js` folder remains a folder; do not put its files in the repo root.
4. Commit to main.
5. Wait for GitHub Pages deployment.
6. Hard refresh with Ctrl+F5.

IMPORTANT FILES CHANGED/ADDED
-----------------------------
index.html                 updated
styles.css                 updated
js/progression.js          updated
js/supabase.js             updated
js/app.js                  updated
roster.html                NEW
admin.html                 NEW
js/roster.js               NEW
js/admin.js                NEW
AU_TSM_FINAL_POLICY.sql     run this in Supabase, do not need to host it

ADMIN LOGIN
-----------
Open:
https://autsmgm.github.io/au-tsm/admin.html

Use the Supabase Auth email/password account you already created.
The password is never stored in the website source.

PUBLIC ROSTER
-------------
https://autsmgm.github.io/au-tsm/roster.html
