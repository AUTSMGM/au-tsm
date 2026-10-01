const loginSection=document.getElementById('adminLogin');
const panel=document.getElementById('adminPanel');
const loginStatus=document.getElementById('adminLoginStatus');
const pendingContainer=document.getElementById('pendingApplications');
const raiderContainer=document.getElementById('activeRaiders');


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function verifyAdmin(user) {
    if (!user) return false;
    const {data,error}=await database.from('guild_admins')
        .select('user_id,display_name')
        .eq('user_id',user.id)
        .maybeSingle();
    if (error) { console.error(error); return false; }
    if (data) document.getElementById('adminIdentity').textContent=data.display_name || user.email;
    return !!data;
}

async function showAdmin(user) {
    if (!await verifyAdmin(user)) {
        await database.auth.signOut();
        loginSection.hidden=false; panel.hidden=true;
        loginStatus.textContent='This account is not authorised for guild management.';
        return;
    }
    loginSection.hidden=true; panel.hidden=false;
    await loadAdminData();
}

document.getElementById('adminLoginButton').onclick=async function() {
    const email=document.getElementById('adminEmail').value.trim();
    const password=document.getElementById('adminPassword').value;
    this.disabled=true; loginStatus.textContent='Authenticating…';
    const {data,error}=await database.auth.signInWithPassword({email,password});
    this.disabled=false;
    if (error) { loginStatus.textContent=error.message; return; }
    loginStatus.textContent='';
    await showAdmin(data.user);
};

document.getElementById('adminLogoutButton').onclick=async function() {
    await database.auth.signOut();
    panel.hidden=true; loginSection.hidden=false;
    document.getElementById('adminPassword').value='';
};

function adminCard(row, pending) {
    const full=[row.first_name,row.last_name].filter(Boolean).join(' ').trim() || row.character_name;
    const safeId=String(row.id);

    return `<div class="admin-card" data-admin-row="${safeId}">
        <div>
            <div class="admin-character">${escapeHtml(full)}</div>
            <div class="admin-meta">Discord / Player: ${escapeHtml(row.discord_name || 'Not supplied')}</div>
        </div>
        <div>
            <strong>${escapeHtml(row.class_name)} • ${escapeHtml(row.role)}</strong>
            <div class="admin-meta">Body Type ${escapeHtml(String(row.body_type))}</div>
        </div>
        <div class="admin-meta">
            ${pending ? '✓ Raid Ready' : 'Guild Rank: Raider'}<br>
            ${pending ? 'Applied: '+formatAdminDate(row.applied_at) : 'Approved: '+formatAdminDate(row.approved_at)}
        </div>
        <div class="admin-actions">
            <button class="admin-button edit-character" data-edit="${safeId}">EDIT</button>
            ${pending
                ? `<button class="admin-button approve" data-approve="${safeId}">APPROVE</button>
                   <button class="admin-button danger" data-reject="${safeId}">REJECT</button>`
                : `<button class="admin-button danger" data-kick="${safeId}">REMOVE</button>`}
        </div>
    </div>`;
}

function formatAdminDate(value) {
    if (!value) return '—';
    try { return new Date(value).toLocaleString(); } catch (_) { return value; }
}

async function loadAdminData() {
    pendingContainer.innerHTML='<div class="admin-meta">Loading pending applications…</div>';
    raiderContainer.innerHTML='<div class="admin-meta">Loading roster…</div>';

    try {
        const pendingQuery = database.from('guild_rolls')
            .select('id,character_name,first_name,last_name,class_name,role,body_type,discord_name,guild_rank,application_status,roster_active,applied_at,approved_at')
            .eq('application_status','Pending')
            .order('applied_at',{ascending:true});

        const raiderQuery = database.from('guild_rolls')
            .select('id,character_name,first_name,last_name,class_name,role,body_type,discord_name,guild_rank,application_status,roster_active,applied_at,approved_at')
            .eq('roster_active',true)
            .eq('guild_rank','Raider')
            .order('approved_at',{ascending:true});

        const [pending, raiders] = await Promise.all([pendingQuery, raiderQuery]);

        if (pending.error) throw pending.error;
        if (raiders.error) throw raiders.error;

        const pendingRows = pending.data || [];
        const raiderRows = raiders.data || [];

        pendingContainer.innerHTML=pendingRows.length
            ? pendingRows.map(x=>adminCard(x,true)).join('')
            : '<div class="admin-meta">No pending applications. The bureaucracy is temporarily winning.</div>';

        raiderContainer.innerHTML=raiderRows.length
            ? raiderRows.map(x=>adminCard(x,false)).join('')
            : '<div class="admin-meta">No approved Raiders yet.</div>';

        bindAdminActions();
    } catch (error) {
        console.error('Guild Tools data load failed:', error);
        const detail = escapeHtml(error && error.message ? error.message : String(error));
        pendingContainer.innerHTML =
            '<div class="admin-load-error"><strong>Guild records could not be loaded.</strong><br>' +
            detail +
            '<br><button id="retryAdminLoad" class="admin-button">RETRY</button></div>';
        raiderContainer.innerHTML =
            '<div class="admin-meta">Roster unavailable until the database query succeeds.</div>';
        document.getElementById('retryAdminLoad')?.addEventListener('click',loadAdminData);
    }
}

function bindAdminActions() {
    document.querySelectorAll('[data-edit]').forEach(btn=>btn.onclick=()=>openCharacterEditor(btn.dataset.edit));
    document.querySelectorAll('[data-approve]').forEach(btn=>btn.onclick=()=>approveApplicant(btn.dataset.approve));
    document.querySelectorAll('[data-reject]').forEach(btn=>btn.onclick=()=>rejectApplicant(btn.dataset.reject));
    document.querySelectorAll('[data-kick]').forEach(btn=>btn.onclick=()=>removeRaider(btn.dataset.kick));
}


const ADMIN_CLASSES = ['Warrior','Paladin','Hunter','Rogue','Priest','Shaman','Mage','Warlock','Druid'];

function adminRoleOptions(className, selectedRole) {
    const roles = (typeof classRoles !== 'undefined' && classRoles[className])
        ? classRoles[className]
        : ['DPS'];

    return roles.map(role =>
        `<option value="${escapeHtml(role)}" ${role===selectedRole?'selected':''}>${escapeHtml(role)}</option>`
    ).join('');
}

async function fetchAdminCharacter(id) {
    const {data,error}=await database.from('guild_rolls')
        .select('id,character_name,first_name,last_name,class_name,role,body_type,discord_name,guild_rank,application_status,roster_active')
        .eq('id',id)
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Character record not found.');
    return data;
}

async function openCharacterEditor(id) {
    try {
        const row = await fetchAdminCharacter(id);

        let overlay=document.getElementById('gmCharacterEditor');
        if (!overlay) {
            overlay=document.createElement('div');
            overlay.id='gmCharacterEditor';
            overlay.className='gm-editor-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML=`
            <div class="gm-editor-card" role="dialog" aria-modal="true" aria-labelledby="gmEditorTitle">
                <div class="gm-editor-header">
                    <div>
                        <div class="gm-editor-kicker">GUILD MASTER OVERRIDE</div>
                        <h3 id="gmEditorTitle">Edit Character</h3>
                    </div>
                    <button id="gmEditorClose" class="gm-editor-close" type="button" aria-label="Close">×</button>
                </div>

                <div class="gm-editor-grid">
                    <label>
                        <span>FIRST NAME</span>
                        <input id="gmEditFirstName" type="text" maxlength="18" value="${escapeHtml(row.first_name || '')}">
                    </label>

                    <label>
                        <span>LAST NAME</span>
                        <input id="gmEditLastName" type="text" maxlength="18" value="${escapeHtml(row.last_name || '')}">
                    </label>

                    <label>
                        <span>CLASS</span>
                        <select id="gmEditClass">
                            ${ADMIN_CLASSES.map(name=>`<option value="${name}" ${name===row.class_name?'selected':''}>${name}</option>`).join('')}
                        </select>
                    </label>

                    <label>
                        <span>ROLE</span>
                        <select id="gmEditRole">
                            ${adminRoleOptions(row.class_name,row.role)}
                        </select>
                    </label>

                    <label>
                        <span>BODY TYPE</span>
                        <select id="gmEditBody">
                            <option value="1" ${Number(row.body_type)===1?'selected':''}>Body Type 1</option>
                            <option value="2" ${Number(row.body_type)===2?'selected':''}>Body Type 2</option>
                        </select>
                    </label>

                    <label>
                        <span>DISCORD / PLAYER NAME</span>
                        <input id="gmEditDiscord" type="text" maxlength="40" value="${escapeHtml(row.discord_name || '')}">
                    </label>
                </div>

                <div id="gmEditorStatus" class="gm-editor-status"></div>

                <div class="gm-editor-actions">
                    <button id="gmEditorCancel" class="admin-button" type="button">CANCEL</button>
                    <button id="gmEditorSave" class="admin-button approve" type="button">SAVE CHANGES</button>
                </div>
            </div>
        `;

        overlay.hidden=false;
        requestAnimationFrame(()=>overlay.classList.add('is-visible'));

        const classSelect=document.getElementById('gmEditClass');
        const roleSelect=document.getElementById('gmEditRole');

        classSelect.onchange=function() {
            const valid=(typeof classRoles!=='undefined' && classRoles[this.value]) ? classRoles[this.value] : ['DPS'];
            const oldRole=roleSelect.value;
            roleSelect.innerHTML=valid.map(role=>`<option value="${role}">${role}</option>`).join('');
            roleSelect.value=valid.includes(oldRole) ? oldRole : valid[0];
        };

        function closeEditor() {
            overlay.classList.remove('is-visible');
            window.setTimeout(()=>{ overlay.hidden=true; },180);
        }

        document.getElementById('gmEditorClose').onclick=closeEditor;
        document.getElementById('gmEditorCancel').onclick=closeEditor;
        overlay.onclick=function(event) {
            if (event.target===overlay) closeEditor();
        };

        document.getElementById('gmEditorSave').onclick=async function() {
            const status=document.getElementById('gmEditorStatus');
            const first=document.getElementById('gmEditFirstName').value.trim();
            const last=document.getElementById('gmEditLastName').value.trim();
            const className=document.getElementById('gmEditClass').value;
            const role=document.getElementById('gmEditRole').value;
            const bodyType=Number(document.getElementById('gmEditBody').value);
            const discord=document.getElementById('gmEditDiscord').value.trim();

            if (first.length<1 || last.length<1) {
                status.textContent='First and last name are required.';
                return;
            }

            const validRoles=(typeof classRoles!=='undefined' && classRoles[className]) ? classRoles[className] : ['DPS'];
            if (!validRoles.includes(role)) {
                status.textContent='That role is not valid for the selected class.';
                return;
            }

            this.disabled=true;
            this.textContent='SAVING…';
            status.textContent='';

            const {error}=await database.from('guild_rolls').update({
                first_name:first,
                last_name:last,
                character_name:`${first} ${last}`.trim(),
                class_name:className,
                role:role,
                body_type:bodyType,
                discord_name:discord || null
            }).eq('id',id);

            if (error) {
                status.textContent=error.message;
                this.disabled=false;
                this.textContent='SAVE CHANGES';
                return;
            }

            status.textContent='Saved.';
            await loadAdminData();
            window.setTimeout(closeEditor,350);
        };

    } catch (error) {
        console.error('Could not open character editor:',error);
        alert(error.message || String(error));
    }
}

async function currentAdminId() {
    const {data}=await database.auth.getUser();
    return data.user && data.user.id;
}

async function approveApplicant(id) {
    const uid=await currentAdminId();
    if (!uid) return;
    const {error}=await database.from('guild_rolls').update({
        guild_rank:'Raider',
        application_status:'Approved',
        roster_active:true,
        approved_at:new Date().toISOString(),
        approved_by:uid,
        removed_at:null
    }).eq('id',id).eq('application_status','Pending');
    if (error) { alert(error.message); return; }
    await loadAdminData();
}

async function rejectApplicant(id) {
    if (!confirm('Reject this raid application?')) return;
    const {error}=await database.from('guild_rolls').update({
        application_status:'Rejected',
        roster_active:false
    }).eq('id',id).eq('application_status','Pending');
    if (error) { alert(error.message); return; }
    await loadAdminData();
}

async function removeRaider(id) {
    if (!confirm('Remove this Raider from the official roster? Character history will be retained.')) return;
    const {error}=await database.from('guild_rolls').update({
        roster_active:false,
        removed_at:new Date().toISOString()
    }).eq('id',id).eq('roster_active',true);
    if (error) { alert(error.message); return; }
    await loadAdminData();
}

(async function restoreAdminSession(){
    const {data}=await database.auth.getSession();
    if (data.session && data.session.user) await showAdmin(data.session.user);
})();


document.getElementById('adminRefreshButton')?.addEventListener('click', loadAdminData);
