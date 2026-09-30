AU TSM - CHARACTER CREATION MODES UPDATE

This package is based on the exact au-tsm-main.zip supplied in chat.

CHANGES
- Default character creation is now manual: First Name, Last Name, Class, valid Role and Body Type.
- A large mode selector swaps between CREATE CHARACTER and SPIN THE WHEEL.
- The original wheel and Bad Luck Protection are preserved unchanged in Wheel mode.
- Both modes save the same Trial row in Supabase and feed the same Raid Ready / application progression.
- The Last 30 panel remains visible in either mode.
- The oversized orange Raid Ready application area is replaced by a compact dark WoW-style card.

UPLOAD
Replace your current repository contents with the files in this folder, preserving the js/ folder.
The main new file is js/creator.js. index.html, styles.css and js/supabase.js are also updated.
No additional Supabase SQL migration is required for this update.
