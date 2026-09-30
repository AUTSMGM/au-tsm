AU TSM CENTERING HOTFIX

The previous layout was being shifted left by an older legacy CSS rule:
.wheel-section { margin-left:50%; transform:translateX(-50%); }

This update explicitly resets that transform and restores normal auto-centering
for the creator selector, dashboard and roster.

No Supabase changes are required.
