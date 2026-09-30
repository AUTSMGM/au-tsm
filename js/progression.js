// The encounter captures a copy of the saved row. Names are never identifiers.
let activeCharacter = null;
let raidCharacter = null;
let raidProfile = null;
let selfHealTimer = 0;
let promotionPending = false;

function setCharacter(character, status) {
    activeCharacter = character;
    const label = document.getElementById('characterSaveStatus');
    label.textContent = status || 'Guild Rank: ' + (character.guild_rank === 'Raider' ? 'Raider' : 'Trial');
    document.getElementById('raidGameButton').disabled = !character || character.id == null;
    // Remember only the row ID. On reload, retrieve the authoritative character.
    try {
        if (character) localStorage.setItem('auTsmCharacterId', String(character.id));
        else localStorage.removeItem('auTsmCharacterId');
    } catch (_) { /* Storage can be disabled; the current session still works. */ }
}

function tickSelfHeal(delta) {
    if (!gameRunning || !raidProfile.healInterval) return;
    selfHealTimer += delta;
    if (selfHealTimer >= raidProfile.healInterval) {
        selfHealTimer %= raidProfile.healInterval;
        if (health < PLAYER_MAX_HEALTH) healPlayer('Your ' + raidCharacter.class_name);
    }
}

async function promoteCharacter(character) {
    if (!database || character.id == null) throw Error('Saved character unavailable');
    const {data, error} = await database.from('guild_rolls')
        .update({guild_rank:'Raider'}).eq('id', character.id).eq('guild_rank','Trial')
        .select().maybeSingle();
    if (error) throw error;
    if (data) return data;
    // A retry may follow a successful write whose response was lost.
    const existing = await database.from('guild_rolls').select('*').eq('id',character.id).single();
    if (existing.error) throw existing.error;
    if (existing.data.guild_rank !== 'Raider') throw Error('Promotion not allowed; check Supabase UPDATE permissions');
    return existing.data;
}

async function savePromotion(character) {
    if (promotionPending) return;
    promotionPending = true;
    const status = document.getElementById('promotionStatus');
    const retry = document.getElementById('retryPromotion');
    const reset = document.getElementById('resetInstance');
    retry.hidden = true;
    reset.disabled = true;
    status.textContent = 'Saving Raider promotion…';
    try {
        const saved = await promoteCharacter(character);
        status.textContent = saved.character_name + ' — Guild Rank: Raider!';
        if (activeCharacter && String(activeCharacter.id) === String(saved.id)) setCharacter(saved);
        await loadRecentRolls();
    } catch (error) {
        console.error(error);
        status.textContent = 'Victory recorded in this session, but promotion is not confirmed. Retry saving below.';
        retry.hidden = false;
        retry.onclick = () => savePromotion(character);
    } finally {
        promotionPending = false;
        reset.disabled = false;
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
