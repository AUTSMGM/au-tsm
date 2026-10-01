/* =========================================================
   AU TSM RAID V3 — MOVEMENT / HORDE MODEL / CLEAN BRIEFING
   Loaded after app.js so this deliberately patches the final raid behavior.
========================================================= */

const RAID_V3_MOVE_SPEED = 285;
let raidMoveLeft = false;
let raidMoveRight = false;
let raidPlayerX = 92;
let raidMovementFrame = null;
let raidMovementLastTime = 0;

/* ---------------------------------------------------------
   HORDE PLAYER MODEL
--------------------------------------------------------- */
renderRaidPlayerModel = function(character) {
    if (!character) return;

    const colour = classColourFor(character.class_name);
    const profile = combatProfile(character);
    const bodyClass = Number(character.body_type) === 2 ? "body-type-2" : "body-type-1";

    player.className = bodyClass;
    player.style.setProperty("--class-colour", colour);

    player.innerHTML = `
        <div class="horde-shadow"></div>
        <div class="horde-aura" style="background:${colour}"></div>

        <div class="horde-ear left"></div>
        <div class="horde-ear right"></div>
        <div class="horde-head"></div>
        <div class="horde-eye left"></div>
        <div class="horde-eye right"></div>
        <div class="horde-brow"></div>
        <div class="horde-tusk left"></div>
        <div class="horde-tusk right"></div>
        <div class="horde-hair"></div>
        <div class="horde-neck"></div>

        <div class="horde-arm left"></div>
        <div class="horde-arm right"></div>
        <div class="horde-bracer left"></div>
        <div class="horde-bracer right"></div>

        <div class="horde-torso"></div>
        <div class="horde-chest-plate"></div>
        <div class="horde-shoulder left"></div>
        <div class="horde-shoulder right"></div>
        <div class="horde-belt"></div>

        <div class="horde-leg left"></div>
        <div class="horde-leg right"></div>
        <div class="horde-boot left"></div>
        <div class="horde-boot right"></div>

        <div class="horde-weapon" title="${escapeHtml(profile.name)}">${profile.symbol}</div>
    `;
};

/* ---------------------------------------------------------
   PRE-PULL BRIEFING
--------------------------------------------------------- */
function renderRaidBriefing() {
    if (!raidCharacter || !raidProfile) return;

    message.classList.add("raid-briefing");
    message.style.display = "flex";
    message.innerHTML = `
        <div class="raid-brief-card">
            <h2>ONYXIA</h2>
            <div class="raid-brief-objective">Beat Onyxia. Become Raid Ready.</div>
            <div class="raid-brief-character">
                ${escapeHtml(raidCharacter.character_name)} •
                ${escapeHtml(raidCharacter.class_name)} •
                ${escapeHtml(raidCharacter.role)}
            </div>
            <div class="raid-control-row">
                <span class="raid-control-chip"><kbd>A</kbd><kbd>D</kbd> Move</span>
                <span class="raid-control-chip"><kbd>SPACE</kbd> Jump</span>
                <span class="raid-control-chip"><kbd>S</kbd> Special</span>
            </div>
            <button id="startAgain" class="raid-pull-button">PULL ONYXIA</button>
        </div>
    `;

    document.getElementById("startAgain").onclick = startGame;
}

/* Patch the final resetGame installed by app.js. */
const raidV3LegacyResetGame = resetGame;
resetGame = function() {
    raidV3LegacyResetGame();

    raidPlayerX = 92;
    player.style.left = raidPlayerX + "px";
    player.classList.remove("moving-left","moving-right");
    renderRaidPlayerModel(raidCharacter);
    renderRaidBriefing();
};

/* Remove briefing class as soon as combat starts. */
const raidV3LegacyStartGame = startGame;
startGame = function() {
    raidV3LegacyStartGame();

    if (!gameRunning) return;

    message.classList.remove("raid-briefing");
    raidPlayerX = 92;
    player.style.left = raidPlayerX + "px";
    renderRaidPlayerModel(raidCharacter);
};

/* ---------------------------------------------------------
   FIRE MUST ALWAYS COME FROM ONYXIA
--------------------------------------------------------- */

/* Older guild event #4 spawned a fire from behind the player.
   Keep the event, but launch it from Onyxia instead. */
spawnReverseFire = function() {
    if (!gameRunning) return;

    const element = document.createElement("div");
    element.className = "game-fire";

    const x = Math.max(0, gameArea.clientWidth - 225);
    element.style.left = x + "px";
    gameArea.appendChild(element);

    mechanics.push({
        element,
        x,
        speed:getMechanicSpeed(),
        direction:-1
    });
};

/* ---------------------------------------------------------
   MOVEMENT
--------------------------------------------------------- */
function clampRaidPlayerX(value) {
    const minX = 24;
    const maxX = Math.max(minX, gameArea.clientWidth - 350);
    return Math.max(minX, Math.min(maxX, value));
}

function raidMovementLoop(time) {
    const delta = raidMovementLastTime
        ? Math.min((time - raidMovementLastTime) / 1000, .05)
        : 0;

    raidMovementLastTime = time;

    if (gameRunning && delta > 0) {
        let direction = 0;
        if (raidMoveLeft) direction -= 1;
        if (raidMoveRight) direction += 1;

        if (direction !== 0) {
            raidPlayerX = clampRaidPlayerX(
                raidPlayerX + direction * RAID_V3_MOVE_SPEED * delta
            );

            player.style.left = raidPlayerX + "px";
            player.classList.toggle("moving-left", direction < 0);
            player.classList.toggle("moving-right", direction > 0);
        } else {
            player.classList.remove("moving-left","moving-right");
        }
    }

    raidMovementFrame = requestAnimationFrame(raidMovementLoop);
}

if (!raidMovementFrame) {
    raidMovementFrame = requestAnimationFrame(raidMovementLoop);
}

document.addEventListener("keydown", function(event) {
    if (!overlay || overlay.style.display !== "flex") return;

    if (event.code === "KeyA") {
        raidMoveLeft = true;
        event.preventDefault();
    }

    if (event.code === "KeyD") {
        raidMoveRight = true;
        event.preventDefault();
    }

    if (event.code === "KeyS") {
        event.preventDefault();

        if (gameRunning && currentAction) {
            raidActionButton.click();
        }
    }
});

document.addEventListener("keyup", function(event) {
    if (event.code === "KeyA") {
        raidMoveLeft = false;
        player.classList.remove("moving-left");
    }

    if (event.code === "KeyD") {
        raidMoveRight = false;
        player.classList.remove("moving-right");
    }
});

/* ---------------------------------------------------------
   SPECIAL ACTION PRESENTATION
--------------------------------------------------------- */
const raidV3LegacySpawnRaidAction = spawnRaidAction;
spawnRaidAction = function(type) {
    raidV3LegacySpawnRaidAction(type);

    if (type === "healthstone") {
        raidActionButton.textContent = "S  •  USE HEALTHSTONE";
    } else {
        raidActionButton.textContent = "S  •  BLOODLUST";
    }
};

/* Also keep mouse/touch usable. S is the primary keyboard shortcut. */
raidActionButton.title = "Press S";

/* ---------------------------------------------------------
   CLEAN UP KEY STATE WHEN RAID CLOSES / STOPS
--------------------------------------------------------- */
const raidV3LegacyStopGame = stopGame;
stopGame = function() {
    raidMoveLeft = false;
    raidMoveRight = false;
    player.classList.remove("moving-left","moving-right");
    raidV3LegacyStopGame();
};
