const rosterStatus = document.getElementById('rosterStatus');
const rosterContent = document.getElementById('rosterContent');

const rosterRoleIcons = {Tank:'🛡',Healer:'✚',DPS:'⚔'};
const rosterClassColours = {
    Warrior:'#C79C6E',Paladin:'#F58CBA',Hunter:'#ABD473',Rogue:'#FFF569',
    Priest:'#FFFFFF',Shaman:'#0070DE',Mage:'#69CCF0',Warlock:'#9482C9',Druid:'#FF7D0A'
};
const rosterClassOrder = ['Warrior','Paladin','Hunter','Rogue','Priest','Shaman','Mage','Warlock','Druid'];

function rosterClassIcon(name) {
    return 'https://wow.zamimg.com/images/wow/icons/large/classicon_' + encodeURIComponent(String(name).toLowerCase()) + '.jpg';
}

async function loadOfficialRoster() {
    if (!database) {
        rosterStatus.textContent='Database unavailable.';
        return;
    }

    const {data,error}=await database.from('guild_rolls')
        .select('id,character_name,first_name,last_name,class_name,role,body_type,discord_name,guild_rank,approved_at')
        .eq('roster_active',true)
        .eq('guild_rank','Raider')
        .order('approved_at',{ascending:true,nullsFirst:false});

    if (error) {
        console.error(error);
        rosterStatus.textContent='Roster could not be loaded.';
        return;
    }

    const rows=data || [];
    document.getElementById('rosterTotal').textContent=rows.length;
    document.getElementById('rosterTanks').textContent=rows.filter(x=>x.role==='Tank').length;
    document.getElementById('rosterDps').textContent=rows.filter(x=>x.role==='DPS').length;
    document.getElementById('rosterHealers').textContent=rows.filter(x=>x.role==='Healer').length;

    if (!rows.length) {
        rosterStatus.style.display='block';
        rosterStatus.textContent='No official Raiders yet. Phinky has apparently approved nobody.';
        rosterContent.innerHTML='';
        return;
    }

    rosterStatus.style.display='none';

    rosterContent.innerHTML=['Tank','DPS','Healer'].map(role=>{
        const roleRows=rows.filter(x=>x.role===role);
        if (!roleRows.length) return '';

        const classCards=rosterClassOrder.map(className=>{
            const members=roleRows.filter(x=>x.class_name===className);
            if (!members.length) return '';
            const colour=rosterClassColours[className] || '#ddd';

            return `<div class="roster-class-card">
                <div class="roster-class-title" style="color:${colour}">
                    <img src="${rosterClassIcon(className)}" alt="">
                    ${escapeHtml(className)} (${members.length})
                </div>
                ${members.map(member=>{
                    const full=[member.first_name,member.last_name].filter(Boolean).join(' ').trim() || member.character_name;
                    return `<div class="roster-member">
                        <span>${rosterRoleIcons[role]}</span>
                        <span style="color:${colour}">${escapeHtml(full)}</span>
                        ${member.discord_name ? `<span class="admin-meta">• ${escapeHtml(member.discord_name)}</span>` : ''}
                    </div>`;
                }).join('')}
            </div>`;
        }).join('');

        return `<section class="roster-role-section">
            <div class="roster-role-heading">${rosterRoleIcons[role]} ${role === 'DPS' ? 'DAMAGE' : role.toUpperCase()} (${roleRows.length})</div>
            <div class="roster-class-grid">${classCards}</div>
        </section>`;
    }).join('');
}

loadOfficialRoster();
