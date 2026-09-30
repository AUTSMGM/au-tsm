// The encounter captures a copy of the saved row. Names are never identifiers.
let activeCharacter = null;
let raidCharacter = null;
let raidProfile = null;
let selfHealTimer = 0;
let promotionPending = false;

function setCharacter(character, status) {
    activeCharacter = character;
    const label = document.getElementById('characterSaveStatus');
    label.textContent = status || 'Guild Rank: ' + (character && character.guild_rank ? character.guild_rank : 'Trial');
    document.getElementById('raidGameButton').disabled = !character || character.id == null;
    // Remember only the row ID. On reload, retrieve the authoritative character.
    try {
        if (character) localStorage.setItem('auTsmCharacterId', String(character.id));
        else localStorage.removeItem('auTsmCharacterId');
    } catch (_) { /* Storage can be disabled; the current session still works. */ }
    if (character && typeof refreshApplicationPanel === 'function') refreshApplicationPanel(character);
}

function tickSelfHeal(delta) {
    if (!gameRunning || !raidProfile.healInterval) return;
    selfHealTimer += delta;
    if (selfHealTimer >= raidProfile.healInterval) {
        selfHealTimer %= raidProfile.healInterval;
        if (health < PLAYER_MAX_HEALTH) healPlayer('Your ' + raidCharacter.class_name);
    }
}

async function markRaidReady(character) {
    if (!database || character.id == null) throw Error('Saved character unavailable');

    const {data,error} = await database.from('guild_rolls')
        .update({
            guild_rank:'Raid Ready',
            raid_ready_at:new Date().toISOString()
        })
        .eq('id',character.id)
        .eq('guild_rank','Trial')
        .select()
        .maybeSingle();

    if (error) throw error;
    if (data) return data;

    // Safe retry: the first write may already have succeeded.
    const existing = await database.from('guild_rolls')
        .select('*')
        .eq('id',character.id)
        .single();

    if (existing.error) throw existing.error;
    if (!['Raid Ready','Raider'].includes(existing.data.guild_rank)) {
        throw Error('Raid Ready update was not permitted by Supabase.');
    }
    return existing.data;
}

async function submitRaidApplication(character, discordName) {
    if (!database || character.id == null) throw Error('Saved character unavailable');

    const cleanDiscord = String(discordName || '').trim();
    if (cleanDiscord.length < 2) throw Error('Enter your Discord / player name.');

    const {data,error} = await database.from('guild_rolls')
        .update({
            discord_name:cleanDiscord,
            application_status:'Pending',
            applied_at:new Date().toISOString(),
            roster_active:false
        })
        .eq('id',character.id)
        .eq('guild_rank','Raid Ready')
        .eq('application_status','None')
        .select()
        .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const existing = await database.from('guild_rolls')
        .select('*')
        .eq('id',character.id)
        .single();

    if (existing.error) throw existing.error;
    if (existing.data.application_status !== 'Pending') {
        throw Error('Application could not be submitted.');
    }
    return existing.data;
}

function refreshApplicationPanel(character) {
    const panel = document.getElementById('raidApplicationPanel');
    const form = document.getElementById('raidApplicationForm');
    const message = document.getElementById('raidApplicationMessage');
    const submit = document.getElementById('submitRaidApplication');
    const discord = document.getElementById('discordName');

    if (!panel || !character) return;

    const rank = character.guild_rank || 'Trial';
    const status = character.application_status || 'None';

    if (rank === 'Trial') {
        panel.hidden = true;
        return;
    }

    panel.hidden = false;

    if (rank === 'Raider' && character.roster_active) {
        form.hidden = true;
        message.innerHTML = '<strong>Official Raider.</strong> Phinky has approved this character for the AU TSM Forever roster.';
        return;
    }

    if (status === 'Pending') {
        form.hidden = true;
        message.innerHTML = '<strong>APPLICATION PENDING.</strong> Your paperwork is with Phinky. Repeated Discord lobbying may adversely affect processing times.';
        return;
    }

    if (status === 'Rejected') {
        form.hidden = true;
        message.innerHTML = '<strong>APPLICATION DECLINED.</strong> Guild leadership has elected to protect the remaining raid members.';
        return;
    }

    form.hidden = false;
    message.innerHTML = '<strong>Raid Ready achieved.</strong> Submit this character for Guild Master review to be considered for the official Forever roster.';

    if (discord && character.discord_name) discord.value = character.discord_name;

    if (submit) {
        submit.onclick = async function() {
            submit.disabled = true;
            submit.textContent = 'SUBMITTING PAPERWORK…';
            try {
                const saved = await submitRaidApplication(character, discord.value);
                if (activeCharacter && String(activeCharacter.id) === String(saved.id)) {
                    setCharacter(saved,'Guild Rank: Raid Ready • Application: Pending');
                }
                refreshApplicationPanel(saved);
                await loadRecentRolls();
                showToast('Raid application submitted to Phinky.');
            } catch (error) {
                console.error(error);
                showToast(error.message || 'Application could not be submitted.');
            } finally {
                submit.disabled = false;
                submit.textContent = 'SUBMIT FOR RAID SPOT';
            }
        };
    }
}

async function restoreCharacter() {
    let id;
    try { id = localStorage.getItem('auTsmCharacterId'); } catch (_) { return; }
    if (!id || !database) return;
    // Do not overwrite a new spin with a late restoration response.
    const spinButton = document.getElementById('spinWheelButton');
    spinButton.disabled = true;
    try {
        const {data,error} = await database.from('guild_rolls').select('*').eq('id',id).single();
        if (error) throw error;
        if (!classAttacks[data.class_name] || !['Tank','Healer','DPS'].includes(data.role)) return;
        setCharacter(data);
        document.getElementById('wheelResultName').textContent = data.character_name;
        document.getElementById('wheelResultClass').textContent = data.class_name;
        for (const [field,text] of [['Body','Body Type '+data.body_type],['Role',data.role]]) {
            const element = document.getElementById('wheelResult'+field);
            element.style.display = 'inline-block'; element.textContent = text;
        }
        document.getElementById('wheelResultMessage').textContent = 'Your saved character is ready.';
    } catch (error) { console.warn('Could not restore saved character',error); }
    finally { spinButton.disabled = false; }
}
