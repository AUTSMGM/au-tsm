/* =========================================================
   INITIAL LOAD
========================================================= */

updateProtectionDisplay();

resetRoleDoor();

loadRecentRolls();


/*
Refresh the shared history periodically so somebody
else's roll appears without needing to reload the page.

15 seconds is plenty for a silly guild website and avoids
hammering the database.
*/

if (
    databaseConfigured
) {

    setInterval(
        loadRecentRolls,
        15000
    );

}
restoreCharacter();
