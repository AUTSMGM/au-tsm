const loginSection = document.getElementById('adminLogin');
const panel = document.getElementById('adminPanel');
const loginStatus = document.getElementById('adminLoginStatus');
const pendingContainer = document.getElementById('pendingApplications');
const raiderContainer = document.getElementById('activeRaiders');


/* =========================================================
   SAFE HTML OUTPUT
========================================================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   VERIFY GUILD MASTER
========================================================= */

async function verifyAdmin(user) {

    if (!user) {
        return false;
    }

    const { data, error } = await database
        .from('guild_admins')
        .select('user_id, display_name')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error("Admin verification failed:", error);
        return false;
    }

    if (data) {

        const identity =
            document.getElementById('adminIdentity');

        if (identity) {
            identity.textContent =
                data.display_name || user.email;
        }
    }

    return !!data;
}


/* =========================================================
   SHOW ADMIN PANEL
========================================================= */

async function showAdmin(user) {

    const authorised =
        await verifyAdmin(user);

    if (!authorised) {

        await database.auth.signOut();

        loginSection.hidden = false;
        panel.hidden = true;

        loginStatus.textContent =
            'This account is not authorised for guild management.';

        return;
    }

    loginSection.hidden = true;
    panel.hidden = false;

    await loadAdminData();
}


/* =========================================================
   LOGIN
========================================================= */

const loginButton =
    document.getElementById('adminLoginButton');

if (loginButton) {

    loginButton.onclick =
        async function () {

            const email =
                document
                    .getElementById('adminEmail')
                    .value
                    .trim();

            const password =
                document
                    .getElementById('adminPassword')
                    .value;

            this.disabled = true;

            loginStatus.textContent =
                'Authenticating...';

            const { data, error } =
                await database.auth
                    .signInWithPassword({
                        email,
                        password
                    });

            this.disabled = false;

            if (error) {

                loginStatus.textContent =
                    error.message;

                return;
            }

            loginStatus.textContent = '';

            await showAdmin(data.user);
        };
}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById('adminLogoutButton');

if (logoutButton) {

    logoutButton.onclick =
        async function () {

            await database.auth.signOut();

            panel.hidden = true;
            loginSection.hidden = false;

            const password =
                document.getElementById(
                    'adminPassword'
                );

            if (password) {
                password.value = '';
            }
        };
}


/* =========================================================
   APPLICATION / RAIDER CARD
========================================================= */

function adminCard(row, pending) {

    const fullName =
        [
            row.first_name,
            row.last_name
        ]
        .filter(Boolean)
        .join(' ')
        .trim()
        ||
        row.character_name
        ||
        'Unknown Character';

    const characterClass =
        row.class_name || 'Unknown';

    const role =
        row.role || 'Unknown';

    const bodyType =
        row.body_type
            ? `Body Type ${row.body_type}`
            : 'Body Type Unknown';

    const discord =
        row.discord_name || 'Not supplied';

    const rank =
        row.guild_rank || 'Raid Ready';

    let buttons = '';

    if (pending) {

        buttons = `
            <div class="admin-card-actions">

                <button
                    class="admin-button approve-application"
                    data-id="${row.id}">
                    APPROVE
                </button>

                <button
                    class="admin-button reject-application"
                    data-id="${row.id}">
                    REJECT
                </button>

            </div>
        `;

    } else {

        buttons = `
            <div class="admin-card-actions">

                <button
                    class="admin-button remove-raider"
                    data-id="${row.id}">
                    REMOVE FROM ROSTER
                </button>

            </div>
        `;
    }

    return `
        <div class="admin-card">

            <div class="admin-card-main">

                <div class="admin-card-name">
                    ${escapeHtml(fullName)}
                </div>

                <div class="admin-card-details">

                    <span>
                        ${escapeHtml(characterClass)}
                    </span>

                    <span>
                        ${escapeHtml(role)}
                    </span>

                    <span>
                        ${escapeHtml(bodyType)}
                    </span>

                    <span>
                        Guild Rank:
                        ${escapeHtml(rank)}
                    </span>

                    <span>
                        Discord:
                        ${escapeHtml(discord)}
                    </span>

                </div>

            </div>

            ${buttons}

        </div>
    `;
}


/* =========================================================
   LOAD APPLICATIONS + RAIDERS
========================================================= */

async function loadAdminData() {

    pendingContainer.innerHTML =
        '<div class="admin-meta">Loading pending applications...</div>';

    raiderContainer.innerHTML =
        '<div class="admin-meta">Loading roster...</div>';

    try {

        /* ---------------------------------------------
           PENDING APPLICATIONS
        --------------------------------------------- */

        const {
            data: pendingRows,
            error: pendingError
        } = await database
            .from('guild_rolls')
            .select(`
                id,
                character_name,
                first_name,
                last_name,
                class_name,
                role,
                body_type,
                discord_name,
                guild_rank,
                application_status,
                roster_active,
                applied_at,
                approved_at
            `)
            .eq('application_status', 'Pending')
            .order('applied_at', {
                ascending: true
            });


        if (pendingError) {
            throw pendingError;
        }


        /* ---------------------------------------------
           CURRENT RAIDERS
        --------------------------------------------- */

        const {
            data: raiderRows,
            error: raiderError
        } = await database
            .from('guild_rolls')
            .select(`
                id,
                character_name,
                first_name,
                last_name,
                class_name,
                role,
                body_type,
                discord_name,
                guild_rank,
                application_status,
                roster_active,
                applied_at,
                approved_at
            `)
            .eq('roster_active', true)
            .eq('guild_rank', 'Raider')
            .order('approved_at', {
                ascending: true
            });


        if (raiderError) {
            throw raiderError;
        }


        /* ---------------------------------------------
           DISPLAY PENDING APPLICATIONS
        --------------------------------------------- */

        if (
            pendingRows &&
            pendingRows.length
        ) {

            pendingContainer.innerHTML =
                pendingRows
                    .map(function (row) {
                        return adminCard(
                            row,
                            true
                        );
                    })
                    .join('');

        } else {

            pendingContainer.innerHTML =
                '<div class="admin-meta">No pending applications. The bureaucracy is temporarily winning.</div>';
        }


        /* ---------------------------------------------
           DISPLAY CURRENT RAIDERS
        --------------------------------------------- */

        if (
            raiderRows &&
            raiderRows.length
        ) {

            raiderContainer.innerHTML =
                raiderRows
                    .map(function (row) {
                        return adminCard(
                            row,
                            false
                        );
                    })
                    .join('');

        } else {

            raiderContainer.innerHTML =
                '<div class="admin-meta">No approved Raiders yet.</div>';
        }


        bindAdminActions();

    } catch (error) {

        console.error(
            'Guild Tools data load failed:',
            error
        );

        const errorMessage =
            escapeHtml(
                error?.message ||
                String(error)
            );

        pendingContainer.innerHTML = `
            <div class="admin-load-error">

                <strong>
                    Guild records could not be loaded.
                </strong>

                <br><br>

                ${errorMessage}

                <br><br>

                <button
                    id="retryAdminLoad"
                    class="admin-button">
                    RETRY
                </button>

            </div>
        `;

        raiderContainer.innerHTML =
            '<div class="admin-meta">Roster unavailable until the database query succeeds.</div>';


        const retry =
            document.getElementById(
                'retryAdminLoad'
            );

        if (retry) {
            retry.addEventListener(
                'click',
                loadAdminData
            );
        }
    }
}


/* =========================================================
   ADMIN ACTION BUTTONS
========================================================= */

function bindAdminActions() {

    /* ---------------------------------------------
       APPROVE APPLICATION
    --------------------------------------------- */

    document
        .querySelectorAll(
            '.approve-application'
        )
        .forEach(function (button) {

            button.onclick =
                async function () {

                    const id =
                        this.dataset.id;

                    this.disabled = true;

                    this.textContent =
                        'APPROVING...';

                    const {
                        error
                    } = await database
                        .from('guild_rolls')
                        .update({
                            guild_rank:
                                'Raider',

                            application_status:
                                'Approved',

                            roster_active:
                                true,

                            approved_at:
                                new Date()
                                    .toISOString()
                        })
                        .eq('id', id);


                    if (error) {

                        console.error(
                            'Approval failed:',
                            error
                        );

                        alert(
                            'Approval failed: ' +
                            error.message
                        );

                        this.disabled = false;

                        this.textContent =
                            'APPROVE';

                        return;
                    }


                    await loadAdminData();
                };
        });


    /* ---------------------------------------------
       REJECT APPLICATION
    --------------------------------------------- */

    document
        .querySelectorAll(
            '.reject-application'
        )
        .forEach(function (button) {

            button.onclick =
                async function () {

                    const id =
                        this.dataset.id;

                    const confirmed =
                        confirm(
                            'Reject this raid application?'
                        );

                    if (!confirmed) {
                        return;
                    }

                    this.disabled = true;

                    const {
                        error
                    } = await database
                        .from('guild_rolls')
                        .update({
                            application_status:
                                'Rejected',

                            roster_active:
                                false
                        })
                        .eq('id', id);


                    if (error) {

                        console.error(
                            'Rejection failed:',
                            error
                        );

                        alert(
                            'Rejection failed: ' +
                            error.message
                        );

                        this.disabled = false;

                        return;
                    }


                    await loadAdminData();
                };
        });


    /* ---------------------------------------------
       REMOVE RAIDER
    --------------------------------------------- */

    document
        .querySelectorAll(
            '.remove-raider'
        )
        .forEach(function (button) {

            button.onclick =
                async function () {

                    const id =
                        this.dataset.id;

                    const confirmed =
                        confirm(
                            'Remove this character from the official raid roster?'
                        );

                    if (!confirmed) {
                        return;
                    }

                    this.disabled = true;

                    const {
                        error
                    } = await database
                        .from('guild_rolls')
                        .update({
                            roster_active:
                                false,

                            application_status:
                                'Removed'
                        })
                        .eq('id', id);


                    if (error) {

                        console.error(
                            'Roster removal failed:',
                            error
                        );

                        alert(
                            'Roster removal failed: ' +
                            error.message
                        );

                        this.disabled = false;

                        return;
                    }


                    await loadAdminData();
                };
        });
}


/* =========================================================
   REFRESH BUTTON
========================================================= */

const refreshButton =
    document.getElementById(
        'adminRefreshButton'
    );

if (refreshButton) {

    refreshButton.addEventListener(
        'click',
        async function () {

            this.disabled = true;

            this.textContent =
                'REFRESHING...';

            await loadAdminData();

            this.disabled = false;

            this.textContent =
                'REFRESH';
        }
    );
}


/* =========================================================
   RESTORE EXISTING LOGIN SESSION
========================================================= */

async function restoreAdminSession() {

    try {

        const {
            data,
            error
        } = await database.auth.getUser();


        if (error) {

            console.error(
                'Could not restore admin session:',
                error
            );

            loginSection.hidden =
                false;

            panel.hidden =
                true;

            return;
        }


        if (
            data &&
            data.user
        ) {

            await showAdmin(
                data.user
            );

        } else {

            loginSection.hidden =
                false;

            panel.hidden =
                true;
        }

    } catch (error) {

        console.error(
            'Admin session restore failed:',
            error
        );

        loginSection.hidden =
            false;

        panel.hidden =
            true;
    }
}


/* =========================================================
   START
========================================================= */

restoreAdminSession();
