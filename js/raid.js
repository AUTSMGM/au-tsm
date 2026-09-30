/* =========================================================
   RAID GAME REFERENCES
========================================================= */

const overlay =
    document.getElementById(
        "raidGameOverlay"
    );

const gameArea =
    document.getElementById(
        "gameArea"
    );

const player =
    document.getElementById(
        "gamePlayer"
    );

const healthDisplay =
    document.getElementById(
        "gameHealth"
    );

const bossFill =
    document.getElementById(
        "bossHealthFill"
    );

const bossText =
    document.getElementById(
        "bossHealthText"
    );

const fightTimerDisplay =
    document.getElementById(
        "fightTimer"
    );

const combatStatus =
    document.getElementById(
        "combatStatus"
    );

const message =
    document.getElementById(
        "gameMessage"
    );

const raidWarning =
    document.getElementById(
        "raidWarning"
    );

const leftCombatFeed =
    document.getElementById(
        "leftCombatFeed"
    );

const rightDamageFeed =
    document.getElementById(
        "rightDamageFeed"
    );

const raidActionPrompt =
    document.getElementById(
        "raidActionPrompt"
    );

const raidActionButton =
    document.getElementById(
        "raidActionButton"
    );


const BOSS_MAX_HP =
    220;

let PLAYER_MAX_HEALTH =
    5;

const NORMAL_DAMAGE =
    5;

const CRIT_DAMAGE =
    10;

const CRIT_CHANCE =
    .25;


let gameRunning =
    false;

let health =
    PLAYER_MAX_HEALTH;

let bossHealth =
    BOSS_MAX_HP;

let fightTime =
    0;

let playerY =
    0;

let velocityY =
    0;

let lastFrame =
    0;

let mechanicTimer =
    2;

let attackTimer =
    2.6;

let guildEventTimer =
    7;

let dpsTickTimer =
    1;

let mechanics =
    [];

let bolts =
    [];

let animation =
    null;

let currentPhase =
    1;

let moreDotsTriggered =
    false;

let reviveUsed =
    false;

let dpsPausedUntil =
    0;

let damagePenaltyUntil =
    0;

let currentAction =
    null;

let actionTimeout =
    null;


let raidDamage =
{

    Chris:
        0,

    Player:
        0,

    Fayne:
        0,

    Sev:
        0,

    Roks:
        0

};


/* =========================================================
   OPEN RAID
========================================================= */

document
.getElementById(
    "raidGameButton"
)
.onclick =
function() {

    if (!activeCharacter || activeCharacter.id == null || wheelSpinning) return;
    raidCharacter=Object.freeze({...activeCharacter});
    raidProfile=combatProfile(raidCharacter);
    PLAYER_MAX_HEALTH=raidProfile.maxHealth;
    document.getElementById('raidCharacterSummary').textContent=raidCharacter.character_name+' • '+raidCharacter.class_name+' • '+raidCharacter.role+' • '+raidProfile.name;
    player.textContent=raidCharacter.class_name==='Hunter'?'🏹':raidProfile.symbol;
    overlay.style.display =
        "flex";


    resetGame();

};


document
.getElementById(
    "closeRaidGame"
)
.onclick =
function() {

    stopGame();


    clearObjects();


    overlay.style.display =
        "none";

};


/* =========================================================
   RESET RAID
========================================================= */

function resetGame() {

    stopGame();


    clearObjects();


    clearCombatFeeds();


    health =
        PLAYER_MAX_HEALTH;


    bossHealth =
        BOSS_MAX_HP;


    fightTime =
        0;


    playerY =
        0;


    velocityY =
        0;


    currentPhase =
        1;


    moreDotsTriggered =
        false;


    reviveUsed =
        false;


    raidDamage =
    {

        Chris:
            0,

        Player:
            0,

        Fayne:
            0,

        Sev:
            0,

        Roks:
            0

    };


    updateHealthDisplay();


    updateBoss();


    updateDpsMeter();


    message.style.display =
        "flex";


    message.innerHTML =
        `

        <h2>
        ONYXIA
        </h2>

        <p>

        <strong>Phase 1:</strong>
        Ground fire only.

        <br><br>

        <strong>Phase 2:</strong>
        Ground fire + fire breath.

        <br><br>

        <strong>Phase 3:</strong>
        Same mechanics at approximately twice the frequency.

        <br><br>

        ${escapeHtml(raidCharacter.character_name)} — ${escapeHtml(raidCharacter.class_name)} / ${escapeHtml(raidCharacter.role)}.<br>You have ${PLAYER_MAX_HEALTH} hearts. ${raidProfile.name} deals ${NORMAL_DAMAGE * raidProfile.damageMultiplier} damage (${CRIT_DAMAGE * raidProfile.damageMultiplier} on a crit).${raidProfile.healInterval ? "<br>Self-heal: +1 heart every 6 seconds while injured." : ""}

        </p>

        <button id="startAgain">
        PULL BOSS
        </button>

        `;


    document
    .getElementById(
        "startAgain"
    )
    .onclick =
        startGame;

}


/* =========================================================
   START RAID
========================================================= */

function startGame() {
    if (!raidCharacter || !raidProfile || promotionPending) return;
    resetGame();
    selfHealTimer=0;
    dpsTickTimer=1;
    dpsPausedUntil=0;
    damagePenaltyUntil=0;

    stopGame();


    clearObjects();


    clearCombatFeeds();


    health =
        PLAYER_MAX_HEALTH;


    bossHealth =
        BOSS_MAX_HP;


    fightTime =
        0;


    playerY =
        0;


    velocityY =
        0;


    currentPhase =
        1;


    moreDotsTriggered =
        false;


    mechanicTimer =
        2.5;


    attackTimer =
        2.6;


    guildEventTimer =
        7;


    gameRunning =
        true;


    message.style.display =
        "none";


    queueSound(
        verySlowlySound
    );


    showRaidWarning(
        "PHASE 1 — VERY VERY SLOWLY DPS"
    );


    lastFrame =
        performance.now();


    animation =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   JUMP
========================================================= */

function jump() {

    if (
        gameRunning
        &&
        playerY <=
        1
    ) {

        velocityY =
            570;

    }

}


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code ===
            "Space"
            ||
            event.code ===
            "ArrowUp"
        ) {

            event.preventDefault();


            jump();

        }

    }
);


gameArea.addEventListener(
    "pointerdown",
    function(event) {

        if (
            !event.target.closest(
                "button"
            )
        ) {

            jump();

        }

    }
);


/* =========================================================
   RAID LOOP
========================================================= */

function gameLoop(time) {

    if (
        !gameRunning
    ) {

        return;

    }


    const delta =
        Math.min(
            (
                time -
                lastFrame
            )
            /
            1000,
            .05
        );


    lastFrame =
        time;


    fightTime +=
        delta;
    tickSelfHeal(delta);


    fightTimerDisplay.textContent =
        fightTime.toFixed(
            1
        );


    velocityY -=
        1500 *
        delta;


    playerY +=
        velocityY *
        delta;


    if (
        playerY <
        0
    ) {

        playerY =
            0;


        velocityY =
            0;

    }


    player.style.bottom =
        (
            55 +
            playerY
        )
        +
        "px";


    mechanicTimer -=
        delta;


    if (
        mechanicTimer <=
        0
    ) {

        spawnMechanic();


        mechanicTimer =
            getMechanicInterval();

    }


    attackTimer -=
        delta;


    if (
        attackTimer <=
        0
    ) {

        playerAttack();


        attackTimer =
            2.55 +
            Math.random()
            *
            .35;

    }


    guildEventTimer -=
        delta;


    if (
        guildEventTimer <=
        0
    ) {

        triggerGuildEvent();


        guildEventTimer =
            randomNumber(
                5,
                9
            );

    }


    dpsTickTimer -=
        delta;


    if (
        dpsTickTimer <=
        0
    ) {

        simulateRaidDamage();


        dpsTickTimer =
            1;

    }


    updateMechanics(
        delta
    );


    updateBolts(
        delta
    );


    animation =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   PHASES
========================================================= */

function updatePhase() {

    let newPhase =
        1;


    if (
        bossHealth <=
        BOSS_MAX_HP *
        .70
    ) {

        newPhase =
            2;

    }


    if (
        bossHealth <=
        BOSS_MAX_HP *
        .40
    ) {

        newPhase =
            3;

    }


    if (
        newPhase ===
        currentPhase
    ) {

        return;

    }


    currentPhase =
        newPhase;


    updateCombatStatus();


    if (
        currentPhase ===
        2
    ) {

        showRaidWarning(
            "PHASE 2 — DEEP BREATHS INCOMING"
        );

    }


    if (
        currentPhase ===
        3
    ) {

        showRaidWarning(
            "PHASE 3 — TWICE THE PANIC"
        );

    }

}


function getMechanicInterval() {

    if (
        currentPhase ===
        1
    ) {

        return randomNumber(
            24,
            32
        )
        /
        10;

    }


    if (
        currentPhase ===
        2
    ) {

        return randomNumber(
            20,
            26
        )
        /
        10;

    }


    return randomNumber(
        10,
        13
    )
    /
    10;

}


function getMechanicSpeed() {

    if (
        currentPhase ===
        1
    ) {

        return randomNumber(
            285,
            320
        );

    }


    if (
        currentPhase ===
        2
    ) {

        return randomNumber(
            295,
            335
        );

    }


    return randomNumber(
        310,
        350
    );

}


/* =========================================================
   MECHANICS
========================================================= */

function spawnMechanic() {

    const element =
        document.createElement(
            "div"
        );


    if (
        currentPhase ===
        1
    ) {

        element.className =
            "game-fire";

    }

    else if (
        Math.random() <
        .60
    ) {

        element.className =
            "game-fire";

    }

    else {

        element.className =
            "game-breath";


        element.style.bottom =
            "150px";


        showRaidWarning(
            "DEEP BREATH — STAY LOW"
        );

    }


    const x =
        gameArea.clientWidth -
        225;


    element.style.left =
        x +
        "px";


    gameArea.appendChild(
        element
    );


    mechanics.push(
        {

            element:
                element,

            x:
                x,

            speed:
                getMechanicSpeed(),

            direction:
                -1

        }
    );

}


function spawnReverseFire() {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "game-fire";


    element.style.left =
        "-20px";


    gameArea.appendChild(
        element
    );


    mechanics.push(
        {

            element:
                element,

            x:
                -20,

            speed:
                300,

            direction:
                1

        }
    );

}


function updateMechanics(delta) {

    const playerRect =
        player.getBoundingClientRect();


    for (
        let i =
            mechanics.length -
            1;

        i >=
        0;

        i--
    ) {

        const mechanic =
            mechanics[
                i
            ];


        mechanic.x +=
            mechanic.speed
            *
            mechanic.direction
            *
            delta;


        mechanic.element.style.left =
            mechanic.x
            +
            "px";


        const rect =
            mechanic.element
            .getBoundingClientRect();


        if (
            overlap(
                playerRect,
                rect
            )
        ) {

            mechanic.element.remove();


            mechanics.splice(
                i,
                1
            );


            damagePlayer();


            continue;

        }


        if (
            mechanic.x <
            -180
            ||
            mechanic.x >
            gameArea.clientWidth
            +
            180
        ) {

            mechanic.element.remove();


            mechanics.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   PLAYER ATTACK
========================================================= */

function playerAttack() {

    if (
        !gameRunning
    ) {

        return;

    }


    const crit =
        Math.random()
        <
        CRIT_CHANCE;


    const damage = (crit ? CRIT_DAMAGE : NORMAL_DAMAGE) * raidProfile.damageMultiplier;


    raidDamage.Player +=
        damage *
        100;


    damageBoss(
        damage,
        crit
    );


    castClassAttackVisual(
        crit
    );

}


function castClassAttackVisual(crit) {

    const bolt =
        document.createElement(
            "div"
        );


    bolt.className = raidCharacter.class_name==='Shaman' ? 'lightning-bolt' : 'class-projectile';
    bolt.textContent=raidCharacter.class_name==='Shaman'?'':raidProfile.symbol;
    bolt.style.color=raidProfile.colour;
    bolt.title=raidProfile.name;


    if (
        crit
    ) {

        bolt.classList.add(
            "crit-bolt"
        );

    }


    bolt.style.left =
        "135px";


    bolt.style.bottom =
        (
            93 +
            playerY
        )
        +
        "px";


    gameArea.appendChild(
        bolt
    );


    bolts.push(
        {

            element:
                bolt,

            x:
                135,

            speed:
                crit
                ?
                800
                :
                680

        }
    );

}


function updateBolts(delta) {

    const target =
        gameArea.clientWidth
        -
        180;


    for (
        let i =
            bolts.length -
            1;

        i >=
        0;

        i--
    ) {

        bolts[i].x +=
            bolts[i].speed
            *
            delta;


        bolts[i]
        .element
        .style
        .left =
            bolts[i].x
            +
            "px";


        if (
            bolts[i].x >=
            target
        ) {

            bolts[i]
            .element
            .remove();


            bolts.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   BOSS DAMAGE
========================================================= */

function damageBoss(
    amount,
    crit
) {

    if (
        !gameRunning
    ) {

        return;

    }


    bossHealth -=
        amount;


    bossHealth =
        Math.max(
            bossHealth,
            0
        );


    updateBoss();


    updatePhase();


    addDamageEvent(
        amount,
        crit
    );


    if (
        bossHealth <=
        BOSS_MAX_HP /
        2
        &&
        !moreDotsTriggered
    ) {

        moreDotsTriggered =
            true;


        queueSound(
            moreDotsSound
        );


        showRaidWarning(
            "MORE DOTS"
        );

    }


    if (
        bossHealth <=
        0
    ) {

        victory();

    }

}


function addDamageEvent(
    amount,
    crit
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        crit
        ?
        "damage-event crit"
        :
        "damage-event";


    element.textContent =
        crit
        ?
        "⚡ CRITICAL! -"
        +
        amount
        :
        "⚡ -"
        +
        amount;


    rightDamageFeed.prepend(
        element
    );


    setTimeout(
        function() {

            element.remove();

        },
        1300
    );

}


function updateBoss() {

    bossFill.style.width =
        (
            bossHealth
            /
            BOSS_MAX_HP
            *
            100
        )
        +
        "%";


    bossText.textContent =
        Math.ceil(
            bossHealth
        )
        +
        " / "
        +
        BOSS_MAX_HP;

}


/* =========================================================
   RAID EVENTS
========================================================= */

function addLeftEvent(
    text,
    type =
    ""
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "left-event";


    if (
        type
    ) {

        element.classList.add(
            type
        );

    }


    element.textContent =
        text;


    leftCombatFeed.prepend(
        element
    );


    setTimeout(
        function() {

            element.remove();

        },
        5000
    );

}


function triggerGuildEvent() {

    const event =
        randomNumber(
            1,
            12
        );


    if (
        event ===
        1
    ) {

        addLeftEvent(
            "Chris uses cooldowns. Of course he does.",
            "buff"
        );


        damageBoss(
            3,
            false
        );

    }


    if (
        event ===
        2
    ) {

        addLeftEvent(
            "Fayne activates Bladestorm. Mechanics suspended.",
            "buff"
        );


        damageBoss(
            3,
            false
        );

    }


    if (
        event ===
        3
    ) {

        addLeftEvent(
            "Roks stood in fire and died.",
            "warning-event"
        );

    }


    if (
        event ===
        4
    ) {

        spawnReverseFire();

    }


    if (
        event ===
        5
    ) {

        healPlayer(
            "Marsmallow"
        );

    }


    if (
        event ===
        6
    ) {

        healPlayer(
            "Sev"
        );

    }


    if (
        event ===
        7
    ) {

        healPlayer(
            "Jaydo"
        );

    }


    if (
        event ===
        8
    ) {

        spawnRaidAction(
            "healthstone"
        );

    }


    if (
        event ===
        9
    ) {

        spawnRaidAction(
            "bloodlust"
        );

    }

}


function healPlayer(name) {

    if (
        health >=
        PLAYER_MAX_HEALTH
    ) {

        return;

    }


    health++;


    updateHealthDisplay();


    addLeftEvent(
        name
        +
        " heals you. +1 ❤",
        "buff"
    );

}


/* =========================================================
   RAID ACTIONS
========================================================= */

function spawnRaidAction(type) {

    if (
        currentAction
    ) {

        return;

    }


    currentAction =
        type;


    raidActionPrompt.style.display =
        "block";


    raidActionButton.textContent =
        type ===
        "healthstone"
        ?
        "🧪 USE HEALTHSTONE"
        :
        "⚡ BLOODLUST";


    actionTimeout =
        setTimeout(
            hideActionPrompt,
            3800
        );

}


raidActionButton.onclick =
    function(event) {

        event.stopPropagation();


        if (
            currentAction ===
            "healthstone"
        ) {

            health =
                Math.min(
                    PLAYER_MAX_HEALTH,
                    health +
                    1
                );


            updateHealthDisplay();

        }


        if (
            currentAction ===
            "bloodlust"
        ) {

            for (
                let i =
                    0;

                i <
                3;

                i++
            ) {

                setTimeout(
                    function() {

                        if (
                            gameRunning
                        ) {

                            playerAttack();

                        }

                    },
                    i *
                    450
                );

            }

        }


        hideActionPrompt();

    };


function hideActionPrompt() {

    currentAction =
        null;


    raidActionPrompt.style.display =
        "none";


    clearTimeout(
        actionTimeout
    );

}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer() {

    const queued =
        soundQueue.some(
            function(item) {

                return item.audio ===
                    wtfSound;

            }
        );


    if (
        !queued
        &&
        wtfSound.paused
    ) {

        queueSound(
            wtfSound,
            2000
        );

    }


    health--;


    updateHealthDisplay();


    if (
        health <=
        0
    ) {

        attemptRevive();

    }

}


function updateHealthDisplay() {

    let hearts =
        "";


    for (
        let i =
            0;

        i <
        PLAYER_MAX_HEALTH;

        i++
    ) {

        hearts +=
            i <
            health
            ?
            "❤ "
            :
            "♡ ";

    }


    healthDisplay.textContent =
        hearts.trim();


    updateCombatStatus();

}


function updateCombatStatus() {

    combatStatus.textContent =
        "PHASE "
        +
        currentPhase
        +
        " • "
        +
        Math.max(
            health,
            0
        )
        +
        "/5 HP";

}


/* =========================================================
   DPS
========================================================= */

function simulateRaidDamage() {

    raidDamage.Chris +=
        randomNumber(
            330,
            390
        );


    raidDamage.Fayne +=
        randomNumber(
            290,
            365
        );


    raidDamage.Sev +=
        randomNumber(
            245,
            320
        );


    raidDamage.Roks +=
        randomNumber(
            15,
            55
        );


    updateDpsMeter();

}


function updateDpsMeter() {

    const max =
        Math.max(
            raidDamage.Chris,
            raidDamage.Player,
            raidDamage.Fayne,
            raidDamage.Sev,
            raidDamage.Roks,
            1
        );


    const rows =
    [

        [
            "Chris",
            "dpsChris",
            "barChris"
        ],

        [
            "Player",
            "dpsPlayer",
            "barPlayer"
        ],

        [
            "Fayne",
            "dpsFayne",
            "barFayne"
        ],

        [
            "Sev",
            "dpsSev",
            "barSev"
        ],

        [
            "Roks",
            "dpsRoks",
            "barRoks"
        ]

    ];


    rows.forEach(
        function(row) {

            const value =
                raidDamage[
                    row[0]
                ];


            document
            .getElementById(
                row[1]
            )
            .textContent =
                Math.round(
                    value
                );


            document
            .getElementById(
                row[2]
            )
            .style.width =
                (
                    value /
                    max *
                    100
                )
                +
                "%";

        }
    );

}


/* =========================================================
   REVIVE / WIPE
========================================================= */

function attemptRevive() {

    if (
        !reviveUsed
        &&
        Math.random() <
        .18
    ) {

        reviveUsed =
            true;


        health =
            1;


        updateHealthDisplay();


        showRaidWarning(
            "ANKH / SOULSTONE!"
        );


        return;

    }


    wipe();

}


function wipe() {

    stopGame();


    message.style.display =
        "flex";


    message.innerHTML =
        `

        <h2 style="color:#d05245">

        ☠ ROKS IS DEAD AGAIN

        </h2>

        <p>

        Raid readiness assessment failed. Your guild rank is unchanged. Try again!

        <br><br>

        Avoidable mechanic detected.

        <br><br>

        Fight duration:
        ${fightTime.toFixed(1)} seconds.

        </p>

        <button id="retry">

        RELEASE SPIRIT &amp; TRY AGAIN

        </button>

        `;


    document
    .getElementById(
        "retry"
    )
    .onclick =
        startGame;

}


/* =========================================================
   VICTORY
========================================================= */

function victory() {

    if (
        !gameRunning
    ) {

        return;

    }


    const victoriousCharacter=raidCharacter;
    stopGame();


    queueSound(
        gratzSound
    );


    message.style.display =
        "flex";


    message.innerHTML =
        `

        <div class="loot-window">

        <div class="loot-title">
        🏆 ONYXIA DEFEATED
        </div>

        <div class="loot-subtitle">
        RAID READINESS ASSESSMENT PASSED
        </div>

        <div class="victory-congratulations">

        <strong>
        Good job Chris!
        </strong>

        And thanks to everyone else who participated.

        <br><br>

        Kill time:
        ${fightTime.toFixed(1)} seconds

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

        <div class="loot-reserved-title">
        LOOT COUNCIL DECISION
        </div>

        <div class="loot-reserved-main">
        ALL ITEMS RESERVED BY PHINKY
        </div>

        <div class="loot-reserved-note">
        Sorry.
        </div>

        </div>


        <p id="promotionStatus" aria-live="polite">Saving Raider promotion…</p>
        <button id="retryPromotion" hidden>RETRY SAVING PROMOTION</button>
        <button id="resetInstance">
        RESET INSTANCE
        </button>

        </div>

        `;


    document
    .getElementById(
        "resetInstance"
    )
    .onclick =
        startGame;
    savePromotion(victoriousCharacter);

}


/* =========================================================
   UTILITIES
========================================================= */

function showRaidWarning(text) {

    raidWarning.textContent =
        text;


    raidWarning.classList.remove(
        "show"
    );


    void raidWarning.offsetWidth;


    raidWarning.classList.add(
        "show"
    );

}


function overlap(
    a,
    b
) {

    const pad =
        7;


    return !(

        a.right -
        pad <
        b.left +
        pad

        ||

        a.left +
        pad >
        b.right -
        pad

        ||

        a.bottom -
        pad <
        b.top +
        pad

        ||

        a.top +
        pad >
        b.bottom -
        pad

    );

}


function stopGame() {
    hideActionPrompt();

    gameRunning =
        false;


    if (
        animation
    ) {

        cancelAnimationFrame(
            animation
        );


        animation =
            null;

    }

}


function clearObjects() {

    mechanics.forEach(
        function(object) {

            object.element.remove();

        }
    );


    bolts.forEach(
        function(object) {

            object.element.remove();

        }
    );


    mechanics =
        [];


    bolts =
        [];

}


function clearCombatFeeds() {

    leftCombatFeed.innerHTML =
        "";


    rightDamageFeed.innerHTML =
        "";

}


document
.getElementById(
    "startRaidGame"
)
.onclick =
    startGame;
