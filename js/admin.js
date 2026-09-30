const loginSection=document.getElementById('adminLogin');
const panel=document.getElementById('adminPanel');
const loginStatus=document.getElementById('adminLoginStatus');
const pendingContainer=document.getElementById('pendingApplications');
const raiderContainer=document.getElementById('activeRaiders');

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
    return `<div class="admin-card">
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
    const pending=await database.from('guild_rolls')
        .select('*').eq('application_status','Pending')
        .order('applied_at',{ascending:true,nullsFirst:false});
    const raiders=await database.from('guild_rolls')
        .select('*').eq('roster_active',true).eq('guild_rank','Raider')
        .order('approved_at',{ascending:true,nullsFirst:false});

    if (pending.error || raiders.error) {
        console.error(pending.error || raiders.error);
        pendingContainer.innerHTML='<div class="admin-meta">Could not load guild data.</div>';
        return;
    }

    pendingContainer.innerHTML=pending.data.length
        ? pending.data.map(x=>adminCard(x,true)).join('')
        : '<div class="admin-meta">No pending applications. The bureaucracy is temporarily winning.</div>';

    raiderContainer.innerHTML=raiders.data.length
        ? raiders.data.map(x=>adminCard(x,false)).join('')
        : '<div class="admin-meta">No approved Raiders yet.</div>';

    bindAdminActions();
}

function bindAdminActions() {
    document.querySelectorAll('[data-approve]').forEach(btn=>btn.onclick=()=>approveApplicant(btn.dataset.approve));
    document.querySelectorAll('[data-reject]').forEach(btn=>btn.onclick=()=>rejectApplicant(btn.dataset.reject));
    document.querySelectorAll('[data-kick]').forEach(btn=>btn.onclick=()=>removeRaider(btn.dataset.kick));
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
