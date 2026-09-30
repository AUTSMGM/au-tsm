/* =========================================================
   AU TSM - RAID / PROMOTION UPDATE
   Replacement js/app.js
   Loaded last, so this file deliberately layers the new raid
   behaviour over the existing modular site without disturbing
   the working wheel / Supabase / jokes code.
========================================================= */

const RAID_V2_BOSS_MAX_HP = 1000;
const RAID_V2_DPS_HP = 100;
const RAID_V2_TANK_HP = 200;
const RAID_V2_MECHANIC_DAMAGE = 20;
const RAID_V2_HEAL_AMOUNT = 20;
const RAID_V2_NORMAL_DAMAGE = 50;
const RAID_V2_CRIT_DAMAGE = 100;
const RAID_V2_HEAL_INTERVAL = 6;

/* =========================================================
   VISUAL PATCHES
========================================================= */

(function injectRaidV2Styles() {
    const style = document.createElement("style");
    style.id = "au-tsm-raid-v2-styles";
    style.textContent = `
    /* Player health now mirrors the WoW-style boss bar. */
    #gameHealth {
        display:inline-flex;
        align-items:center;
        gap:8px;
        min-width:205px;
        font-size:11px !important;
        color:#ddd !important;
        vertical-align:middle;
    }
    .player-health-bar {
        position:relative;
        display:inline-block;
        width:145px;
        height:14px;
        overflow:hidden;
        border:1px solid #29451f;
        background:#180d0d;
        box-shadow:inset 0 0 5px rgba(0,0,0,.8);
    }
    #playerHealthFill {
        position:absolute;
        inset:0 auto 0 0;
        width:100%;
        background:linear-gradient(90deg,#2c7f31,#55b84d);
        transition:width .16s linear, background .16s linear;
    }
    #playerHealthText {
        min-width:52px;
        color:#e6e0d5;
        font-weight:bold;
        text-align:right;
    }

    /* Restore a proper character body and keep the class weapon separate. */
    #gamePlayer {
        overflow:visible !important;
    }
    #gamePlayer .player-class-weapon {
        position:absolute;
        z-index:6;
        right:-19px;
        top:36px;
        min-width:26px;
        font-size:24px;
        line-height:1;
        transform:rotate(-18deg);
        filter:drop-shadow(0 2px 2px rgba(0,0,0,.9));
        pointer-events:none;
    }
    #gamePlayer .player-class-aura {
        position:absolute;
        z-index:-1;
        left:5px;
        top:22px;
        width:38px;
        height:48px;
        border-radius:45%;
        opacity:.20;
        filter:blur(4px);
        pointer-events:none;
    }
    #gamePlayer.body-type-2 .player-body {
        border-radius:8px 8px 3px 3px;
    }
    #gamePlayer.body-type-2 .player-hair {
        width:30px;
        height:19px;
        left:9px;
        top:0;
    }

    /* Slightly punchier projectile presentation for the class-specific spells. */
    .class-projectile {
        position:absolute;
        z-index:25;
        min-width:34px;
        height:24px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:23px;
        font-weight:bold;
        text-shadow:0 2px 3px #000;
        filter:drop-shadow(0 0 5px currentColor);
        pointer-events:none;
    }
    .class-projectile.crit-bolt {
        transform:scale(1.38);
        filter:drop-shadow(0 0 10px currentColor)
               drop-shadow(0 0 16px #ffd54f);
    }

    /* Promotion feed lives beneath Last 30 without making the side panel grow. */
    .roll-history {
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
    }
    #rollHistory {
        flex:1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
    }
    .promotion-feed {
        flex:0 0 145px;
        min-height:145px;
        border-top:1px solid #4a3a29;
        background:#0e0d0c;
        overflow:hidden;
    }
    .promotion-feed-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:9px 11px 7px;
        border-bottom:1px solid #28231e;
    }
    .promotion-feed-header h5 {
        margin:0;
        color:#d7a94b;
        font-family:Georgia,serif;
        font-size:12px;
    }
    .promotion-feed-header span {
        color:#655f57;
        font-size:7px;
        letter-spacing:1.2px;
    }
    #promotionFeed {
        height:105px;
        overflow-y:auto;
        scrollbar-width:thin;
        scrollbar-color:#695033 #111;
    }
    .promotion-row {
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        gap:6px;
        align-items:center;
        min-height:27px;
        padding:5px 10px;
        border-bottom:1px solid #201d19;
        font-size:8px;
    }
    .promotion-name {
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        color:#ddd3c3;
        font-weight:bold;
    }
    .promotion-note {
        color:#7c756b;
        white-space:nowrap;
    }
    .promotion-raider {
        color:#e6bd55;
        font-weight:bold;
    }

    /* Clear victory hierarchy: promotion is the main action, retry is secondary. */
    .promotion-victory-panel {
        margin:14px 0 10px;
        padding:14px;
        border:1px solid #927036;
        background:linear-gradient(180deg,rgba(122,87,26,.18),rgba(31,22,12,.72));
        text-align:center;
    }
    .promotion-victory-title {
        color:#f1ca64;
        font-family:Georgia,serif;
        font-size:20px;
        font-weight:bold;
        letter-spacing:.5px;
    }
    .promotion-victory-status {
        margin-top:7px;
        color:#cfc3b0;
        font-size:11px;
        line-height:1.45;
    }
    .victory-actions {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:9px;
        margin-top:12px;
    }
    .victory-actions button {
        min-width:180px;
    }
    .victory-actions .primary-victory {
        background:#9a7531 !important;
        border-color:#d8ad4f !important;
        color:#130f09 !important;
    }
    .victory-actions .secondary-victory {
        background:#1b1814 !important;
        border-color:#554738 !important;
        color:#aaa194 !important;
    }

    @media(max-width:700px) {
        #gameHealth { min-width:0; }
        .player-health-bar { width:105px; }
        .promotion-feed { flex-basis:135px; min-height:135px; }
    }
    `;
    document.head.appendChild(style);
})();

/* =========================================================
   PROMOTION FEED
========================================================= */

(function createPromotionFeed() {
    const history = document.querySelector(".roll-history");
    const historyList = document.getElementById("rollHistory");
    if (!history || !historyList || document.getElementById("promotionFeedPanel")) return;

    const panel = document.createElement("div");
    panel.id = "promotionFeedPanel";
    panel.className = "promotion-feed";
    panel.innerHTML = `
        <div class="promotion-feed-header">
            <h5>Recent Promotions</h5>
            <span>RAID READY</span>
        </div>
        <div id="promotionFeed">
            <div class="empty-history">No promotions recorded yet.</div>
        </div>
    `;
    history.appendChild(panel);
})();

let promotionTimestampAvailable = true;

function classColourFor(name) {
    const colours = {
        Warrior:"#C79C6E", Paladin:"#F58CBA", Hunter:"#ABD473",
        Rogue:"#FFF569", Priest:"#FFFFFF", Shaman:"#0070DE",
        Mage:"#69CCF0", Warlock:"#9482C9", Druid:"#FF7D0A"
    };
    return colours[name] || "#d7a94b";
}

function renderPromotionFeed(rows) {
    const container = document.getElementById("promotionFeed");
    if (!container) return;

    if (!rows || rows.length === 0) {
        container.innerHTML = `<div class="empty-history">No promotions recorded yet.</div>`;
        return;
    }

    container.innerHTML = rows.slice(0, 8).map(row => {
        const name = escapeHtml(row.character_name || [row.first_name,row.last_name].filter(Boolean).join(" ") || "Unknown Adventurer");
        const cls = escapeHtml(row.class_name || "");
        return `
            <div class="promotion-row">
                <div class="promotion-name" style="color:${classColourFor(row.class_name)}">
                    ${name} <span class="promotion-raider">→ Raider</span>
                </div>
                <div class="promotion-note">${cls} • Onyxia cleared</div>
            </div>
        `;
    }).join("");
}

async function loadRecentPromotions() {
    if (!database) return;

    if (promotionTimestampAvailable) {
        const {data,error} = await database
            .from("guild_rolls")
            .select("id,character_name,first_name,last_name,class_name,role,guild_rank,promoted_at")
            .eq("guild_rank","Raider")
            .order("promoted_at",{ascending:false,nullsFirst:false})
            .limit(8);

        if (!error) {
            renderPromotionFeed(data || []);
            return;
        }

        /* Old schema fallback: don't break the site if migration has not run yet. */
        promotionTimestampAvailable = false;
        console.warn("promoted_at is not available yet; using recent Raider rows as fallback.", error);
    }

    const fallback = (recentRolls || [])
        .filter(row => row.guild_rank === "Raider")
        .slice(0,8);

    renderPromotionFeed(fallback);
}

/* Keep promotions in sync whenever the normal shared list refreshes. */
const legacyLoadRecentRolls = loadRecentRolls;
loadRecentRolls = async function() {
    await legacyLoadRecentRolls();
    await loadRecentPromotions();
};

/* =========================================================
   COMBAT PROFILE - NEW HP SCALE
========================================================= */

combatProfile = function(character) {
    const role = character.role;
    const attack = classAttacks[character.class_name] || {
        name:"Arcane Paperwork",
        symbol:"✦",
        colour:"#d7a94b"
    };

    return {
        ...attack,
        maxHealth: role === "Tank" ? RAID_V2_TANK_HP : RAID_V2_DPS_HP,
        damageMultiplier: role === "DPS" ? 1 : 0.75,
        healInterval: role === "Healer" ? RAID_V2_HEAL_INTERVAL : 0
    };
};

/* =========================================================
   PLAYER MODEL
========================================================= */

function renderRaidPlayerModel(character) {
    if (!character) return;

    const colour = classColourFor(character.class_name);
    const profile = combatProfile(character);
    const bodyClass = Number(character.body_type) === 2 ? "body-type-2" : "body-type-1";

    player.className = bodyClass;
    player.innerHTML = `
        <div class="player-class-aura" style="background:${colour}"></div>
        <div class="player-hair"></div>
        <div class="player-head"></div>
        <div class="player-shoulder shoulder-left" style="border-color:${colour}"></div>
        <div class="player-shoulder shoulder-right" style="border-color:${colour}"></div>
        <div class="player-body" style="background:${colour};filter:brightness(.68)"></div>
        <div class="player-leg leg-left"></div>
        <div class="player-leg leg-right"></div>
        <div class="player-class-weapon" title="${escapeHtml(profile.name)}">${profile.symbol}</div>
    `;
}

/* Fix the Work-mode bug that replaced the model with a single floating symbol. */
document.getElementById("raidGameButton").onclick = function() {
    if (!activeCharacter || activeCharacter.id == null || wheelSpinning) return;

    raidCharacter = Object.freeze({...activeCharacter});
    raidProfile = combatProfile(raidCharacter);
    PLAYER_MAX_HEALTH = raidProfile.maxHealth;

    document.getElementById("raidCharacterSummary").textContent =
        raidCharacter.character_name + " • " +
        raidCharacter.class_name + " • " +
        raidCharacter.role + " • " +
        raidProfile.name;

    renderRaidPlayerModel(raidCharacter);

    overlay.style.display = "flex";
    resetGame();
};

/* =========================================================
   HEALTH BAR
========================================================= */

(function installPlayerHealthBar() {
    healthDisplay.innerHTML = `
        <span class="player-health-bar"><span id="playerHealthFill"></span></span>
        <span id="playerHealthText">100 / 100</span>
    `;
})();

updateHealthDisplay = function() {
    const maximum = Math.max(1, PLAYER_MAX_HEALTH);
    const current = Math.max(0, Math.round(health));
    const percent = Math.max(0, Math.min(100, (current / maximum) * 100));

    const fill = document.getElementById("playerHealthFill");
    const text = document.getElementById("playerHealthText");

    if (fill) {
        fill.style.width = percent + "%";
        fill.style.background =
            percent <= 25
                ? "linear-gradient(90deg,#86251f,#cf493e)"
                : percent <= 50
                    ? "linear-gradient(90deg,#8b6720,#d3a836)"
                    : "linear-gradient(90deg,#2c7f31,#55b84d)";
    }

    if (text) text.textContent = current + " / " + maximum;

    updateCombatStatus();
};

updateCombatStatus = function() {
    combatStatus.textContent =
        "PHASE " + currentPhase +
        " • " + Math.max(0,Math.round(health)) +
        "/" + PLAYER_MAX_HEALTH + " HP";
};

/* =========================================================
   1000 HP BOSS + 45 / 60 SECOND TUNING
========================================================= */

updateBoss = function() {
    const percent = Math.max(0,Math.min(100,(bossHealth / RAID_V2_BOSS_MAX_HP) * 100));
    bossFill.style.width = percent + "%";
    bossText.textContent = Math.ceil(bossHealth) + " / " + RAID_V2_BOSS_MAX_HP;
};

updatePhase = function() {
    let newPhase = 1;
    if (bossHealth <= RAID_V2_BOSS_MAX_HP * 0.70) newPhase = 2;
    if (bossHealth <= RAID_V2_BOSS_MAX_HP * 0.40) newPhase = 3;
    if (newPhase === currentPhase) return;

    currentPhase = newPhase;
    updateCombatStatus();

    if (currentPhase === 2) showRaidWarning("PHASE 2 — DEEP BREATHS INCOMING");
    if (currentPhase === 3) showRaidWarning("PHASE 3 — TWICE THE PANIC");
};

damageBoss = function(amount, crit) {
    if (!gameRunning) return;

    bossHealth -= amount;
    if (bossHealth < 0) bossHealth = 0;

    updateBoss();
    updatePhase();
    addDamageEvent(Math.round(amount), crit);

    if (
        bossHealth <= RAID_V2_BOSS_MAX_HP / 2 &&
        !moreDotsTriggered
    ) {
        moreDotsTriggered = true;
        queueSound(moreDotsSound);
        showRaidWarning("MORE DOTS");
    }

    if (bossHealth <= 0) victory();
};

playerAttack = function() {
    if (!gameRunning || !raidProfile) return;

    const crit = Math.random() < CRIT_CHANCE;
    const raw = crit ? RAID_V2_CRIT_DAMAGE : RAID_V2_NORMAL_DAMAGE;
    const damage = Math.round(raw * raidProfile.damageMultiplier);

    /* Keep the silly guild DPS meter lively while on-screen hit values stay readable. */
    raidDamage.Player += damage * 8;

    damageBoss(damage, crit);
    castClassAttackVisual(crit);
};

/* Existing start/reset code is good; patch the numeric scale immediately after it runs. */
const legacyResetGame = resetGame;
resetGame = function() {
    legacyResetGame();

    if (!raidCharacter || !raidProfile) return;

    PLAYER_MAX_HEALTH = raidProfile.maxHealth;
    health = PLAYER_MAX_HEALTH;
    bossHealth = RAID_V2_BOSS_MAX_HP;

    renderRaidPlayerModel(raidCharacter);
    updateHealthDisplay();
    updateBoss();
    fightTimerDisplay.textContent = "0.0";

    message.innerHTML = `
        <h2>ONYXIA</h2>
        <p>
            Onyxia has <strong>${RAID_V2_BOSS_MAX_HP} HP</strong>.
            <br><br>
            <strong>PHASE 1 — 100% to 70%</strong><br>
            Ground fire only. Jump over it.
            <br><br>
            <strong>PHASE 2 — 70% to 40%</strong><br>
            Ground fire plus fire breath.
            <br><br>
            <strong>PHASE 3 — below 40%</strong><br>
            Both mechanics at approximately twice the frequency.
            <br><br>
            <strong>${escapeHtml(raidCharacter.character_name)}</strong><br>
            ${escapeHtml(raidCharacter.class_name)} • ${escapeHtml(raidCharacter.role)} • ${escapeHtml(raidProfile.name)}
            <br><br>
            ${raidCharacter.role === "Tank"
                ? "Tank profile: <strong>200 HP</strong>, 75% offensive damage."
                : raidCharacter.role === "Healer"
                    ? "Healer profile: <strong>100 HP</strong>, 75% offensive damage and <strong>20 HP self-heal every 6 seconds</strong> while injured."
                    : "DPS profile: <strong>100 HP</strong>, full offensive damage."}
            <br><br>
            Normal hit: <strong>${Math.round(RAID_V2_NORMAL_DAMAGE * raidProfile.damageMultiplier)}</strong>
            • Critical hit: <strong>${Math.round(RAID_V2_CRIT_DAMAGE * raidProfile.damageMultiplier)}</strong>
            • Crit chance: <strong>25%</strong>
        </p>
        <button id="startAgain">PULL BOSS</button>
    `;

    const start = document.getElementById("startAgain");
    if (start) start.onclick = startGame;
};

const legacyStartGame = startGame;
startGame = function() {
    legacyStartGame();

    if (!gameRunning || !raidProfile) return;

    PLAYER_MAX_HEALTH = raidProfile.maxHealth;
    health = PLAYER_MAX_HEALTH;
    bossHealth = RAID_V2_BOSS_MAX_HP;
    selfHealTimer = 0;

    renderRaidPlayerModel(raidCharacter);
    updateHealthDisplay();
    updateBoss();
};

/* =========================================================
   SCALED DAMAGE / HEALING
========================================================= */

healPlayer = function(name) {
    if (!gameRunning || health >= PLAYER_MAX_HEALTH) return;

    const before = health;
    health = Math.min(PLAYER_MAX_HEALTH, health + RAID_V2_HEAL_AMOUNT);
    const healed = Math.round(health - before);

    updateHealthDisplay();

    addLeftEvent(
        name + " heals you for " + healed + " HP.",
        "buff"
    );
};

damagePlayer = function() {
    if (!gameRunning) return;

    const queued = soundQueue.some(item => item.audio === wtfSound);
    if (!queued && wtfSound.paused) queueSound(wtfSound,2000);

    health = Math.max(0, health - RAID_V2_MECHANIC_DAMAGE);
    updateHealthDisplay();

    addLeftEvent(
        "Mechanic hit! -" + RAID_V2_MECHANIC_DAMAGE + " HP",
        "warning-event"
    );

    if (health <= 0) attemptRevive();
};

attemptRevive = function() {
    if (!reviveUsed && Math.random() < .18) {
        reviveUsed = true;
        health = Math.max(1, Math.round(PLAYER_MAX_HEALTH * .20));
        updateHealthDisplay();
        showRaidWarning("ANKH / SOULSTONE!");
        addLeftEvent("Combat resurrection! Back at " + health + " HP.","buff");
        return;
    }

    wipe();
};

/* Scale Healthstone from the old 1-heart system to the new 100/200 HP model. */
raidActionButton.onclick = function(event) {
    event.stopPropagation();

    const action = currentAction;

    if (action === "healthstone") {
        const before = health;
        health = Math.min(PLAYER_MAX_HEALTH,health + RAID_V2_HEAL_AMOUNT);
        updateHealthDisplay();
        addLeftEvent("Healthstone restores " + Math.round(health-before) + " HP.","buff");
    }

    if (action === "bloodlust") {
        for (let i=0;i<3;i++) {
            setTimeout(function() {
                if (gameRunning) playerAttack();
            },i*450);
        }
    }

    hideActionPrompt();
};

/* =========================================================
   PROMOTION WITH TIMESTAMP
========================================================= */

promoteCharacter = async function(character) {
    if (!database || character.id == null) throw Error("Saved character unavailable");

    const timestamp = new Date().toISOString();

    if (promotionTimestampAvailable) {
        const {data,error} = await database
            .from("guild_rolls")
            .update({
                guild_rank:"Raider",
                promoted_at:timestamp
            })
            .eq("id",character.id)
            .eq("guild_rank","Trial")
            .select()
            .maybeSingle();

        if (!error && data) return data;

        if (error && /promoted_at/i.test(String(error.message || error.details || error))) {
            promotionTimestampAvailable = false;
        } else if (error) {
            throw error;
        }
    }

    /* Schema-safe fallback if promoted_at has not been added yet. */
    const {data,error} = await database
        .from("guild_rolls")
        .update({guild_rank:"Raider"})
        .eq("id",character.id)
        .eq("guild_rank","Trial")
        .select()
        .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const existing = await database
        .from("guild_rolls")
        .select("*")
        .eq("id",character.id)
        .single();

    if (existing.error) throw existing.error;
    if (existing.data.guild_rank !== "Raider") {
        throw Error("Promotion not allowed; check Supabase UPDATE permissions");
    }

    return existing.data;
};

/* =========================================================
   VICTORY - PROMOTION IS NOW THE PRIMARY OUTCOME
========================================================= */

victory = function() {
    if (!gameRunning) return;

    const victoriousCharacter = raidCharacter;
    stopGame();
    queueSound(gratzSound);

    message.style.display = "flex";
    message.scrollTop = 0;

    message.innerHTML = `
        <div class="loot-window">
            <div class="loot-title">🏆 ONYXIA DEFEATED</div>
            <div class="loot-subtitle">RAID READINESS ASSESSMENT PASSED</div>

            <div class="victory-congratulations">
                <strong>Good job Chris!</strong>
                And congratulations to ${escapeHtml(victoriousCharacter.character_name)} and everyone else who participated.
                <br><br>
                Kill time: <strong>${fightTime.toFixed(1)} seconds</strong>
            </div>

            <div class="promotion-victory-panel">
                <div class="promotion-victory-title">RAIDER PROMOTION EARNED</div>
                <div id="promotionStatus" class="promotion-victory-status" aria-live="polite">
                    Recording your promotion with the guild bureaucracy…
                </div>
            </div>

            <div class="loot-list">
                <div class="loot-item">
                    <div class="loot-icon">⚔</div>
                    <div>
                        <div class="loot-name">Dragonfire Greatblade</div>
                        <div class="loot-type">Epic Two-Handed Sword</div>
                    </div>
                </div>
                <div class="loot-item">
                    <div class="loot-icon">💍</div>
                    <div>
                        <div class="loot-name">Band of the Spreadsheet</div>
                        <div class="loot-type">Epic Ring</div>
                    </div>
                </div>
                <div class="loot-item">
                    <div class="loot-icon">🪓</div>
                    <div>
                        <div class="loot-name">Fayne's Bladestorm Management Tool</div>
                        <div class="loot-type">Epic Axe</div>
                    </div>
                </div>
                <div class="loot-item">
                    <div class="loot-icon">🔥</div>
                    <div>
                        <div class="loot-name">Roks' Fire Resistance Trinket</div>
                        <div class="loot-type">Still insufficient</div>
                    </div>
                </div>
            </div>

            <div class="loot-reserved">
                <div class="loot-reserved-title">LOOT COUNCIL DECISION</div>
                <div class="loot-reserved-main">ALL ITEMS RESERVED BY PHINKY</div>
                <div class="loot-reserved-note">Sorry.</div>
            </div>

            <div class="victory-actions">
                <button id="returnToGuildHall" class="primary-victory" disabled>
                    SAVING PROMOTION…
                </button>
                <button id="retryPromotion" hidden>
                    RETRY SAVING PROMOTION
                </button>
                <button id="resetInstance" class="secondary-victory">
                    FIGHT ONYXIA AGAIN
                </button>
            </div>
        </div>
    `;

    const returnButton = document.getElementById("returnToGuildHall");
    const retryButton = document.getElementById("retryPromotion");
    const resetButton = document.getElementById("resetInstance");
    const status = document.getElementById("promotionStatus");

    resetButton.onclick = startGame;

    returnButton.onclick = function() {
        overlay.style.display = "none";
        const panel = document.getElementById("promotionFeedPanel");
        if (panel) panel.scrollIntoView({behavior:"smooth",block:"center"});
    };

    (async function saveVictoryPromotion() {
        try {
            promotionPending = true;
            resetButton.disabled = true;

            const saved = await promoteCharacter(victoriousCharacter);

            status.innerHTML =
                `<strong>${escapeHtml(saved.character_name)}</strong> is now officially <strong>Raider</strong>.`;
            returnButton.disabled = false;
            returnButton.textContent = "✓ PROMOTED TO RAIDER — RETURN TO GUILD HALL";

            if (
                activeCharacter &&
                String(activeCharacter.id) === String(saved.id)
            ) {
                setCharacter(saved,"Guild Rank: Raider");
            }

            await loadRecentRolls();
        } catch (error) {
            console.error(error);
            status.textContent =
                "Onyxia is dead, but the paperwork failed. Your promotion has not been confirmed yet.";
            returnButton.disabled = false;
            returnButton.textContent = "RETURN TO GUILD HALL";
            retryButton.hidden = false;
            retryButton.onclick = function() {
                retryButton.hidden = true;
                status.textContent = "Retrying promotion save…";
                saveVictoryPromotion();
            };
        } finally {
            promotionPending = false;
            resetButton.disabled = false;
        }
    })();
};

/* =========================================================
   INITIAL LOAD
========================================================= */

updateProtectionDisplay();
resetRoleDoor();
loadRecentRolls();

if (databaseConfigured) {
    setInterval(loadRecentRolls,15000);
}

restoreCharacter();
