AU TSM Raid / Wheel V3.1 fixes

1. Player attack visuals now launch from the player's live on-screen position.
   Moving with A/D or jumping no longer leaves projectiles spawning at the
   original starting point.

2. Body Type slot alignment fixed.
   The old code used getBoundingClientRect().height inside a CSS-scaled panel.
   That returned a scaled height while translateY used unscaled coordinates,
   producing half-blue / half-pink stops. The slot now uses targetItem.offsetTop
   and performs an exact final snap after the spin.

No Supabase changes are required.
