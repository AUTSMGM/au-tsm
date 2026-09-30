/* =========================================================
   SUPABASE
========================================================= */

/*
Replace these two values with the values from:

Supabase
→ Project Settings
→ API

Use:
Project URL
and
anon / publishable key

DO NOT use the service_role key.
*/

const SUPABASE_URL =
    "https://xuhagpyqkldensgcnkin.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_-6o6pRifuxvzZVARy6ZHgg_WQCWeGMi";


let database =
    null;


const databaseConfigured =
    !SUPABASE_URL.includes(
        "YOUR_"
    )
    &&
    !SUPABASE_ANON_KEY.includes(
        "YOUR_"
    );


if (
    databaseConfigured && window.supabase
) {

    database =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

}
