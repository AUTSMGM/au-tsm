AU TSM Guild Master Character Editing

Guild Tools now adds EDIT to every Pending Application and Current Raider.

The GM can change:
- First name
- Last name
- Class
- Role
- Body Type
- Discord / Player name

Role choices automatically update to match the selected class.
Saving updates the existing guild_rolls row; it does not create a duplicate.

No new SQL should be required if the existing authenticated Guild Master UPDATE
policy is already working (Approve/Reject/Remove currently prove that updates are allowed).
If SAVE returns an RLS error, the policy can be adjusted separately.
