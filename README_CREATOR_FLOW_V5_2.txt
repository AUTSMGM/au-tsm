AU TSM Creator Flow V5.2

Changes:
- Added START OVER after a creator mode is chosen.
- Start Over unlocks/clears names, choices, wheel exclusions and the active
  Character Progression panel without requiring a browser refresh.
- Page refresh deliberately starts with no active Character Progression card.
  Saved characters remain in Supabase / Recent Character Applications.
- Character Progression remains completely hidden until a new Trial character
  is successfully saved.
- After manual creation or a successful wheel spin, a compact next-step panel
  fades in: "Want a raid spot? Beat Onyxia."
- Passing Onyxia still reveals the existing raid application form.
- After successful application submission, Character Progression clears again.
- Existing Trial -> Raid Ready -> Pending -> Raider database flow is unchanged.

No new Supabase SQL is required.
