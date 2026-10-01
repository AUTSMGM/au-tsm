/* =========================================================
   AU TSM PROGRESSIVE CHARACTER CREATOR
========================================================= */

const manualModeButton = document.getElementById('manualModeButton');
const wheelModeButton = document.getElementById('wheelModeButton');
const manualCreationMode = document.getElementById('manualCreationMode');
const wheelNameGate = document.getElementById('wheelNameGate');
const wheelBadLuckPanel = document.getElementById('wheelBadLuckPanel');
const wheelCentrePanel = document.getElementById('wheelCentrePanel');
const creatorModeHeading = document.getElementById('creatorModeHeading');
const creatorModeDescription = document.getElementById('creatorModeDescription');

const manualFirstName = document.getElementById('manualFirstName');
const manualLastName = document.getElementById('manualLastName');
const manualConfirmName = document.getElementById('manualConfirmName');
const manualClassGrid = document.getElementById('manualClassGrid');
const manualBodyGrid = document.getElementById('manualBodyGrid');
const manualRoleGrid = document.getElementById('manualRoleGrid');
const manualCreateButton = document.getElementById('manualCreateButton');
const manualCreatorStatus = document.getElementById('manualCreatorStatus');

const manualClassStep = document.getElementById('manualClassStep');
const manualBodyStep = document.getElementById('manualBodyStep');
const manualRoleStep = document.getElementById('manualRoleStep');
const manualFinishStep = document.getElementById('manualFinishStep');

const wheelConfirmName = document.getElementById('wheelConfirmName');
const wheelFirstName = document.getElementById('firstName');
const wheelLastName = document.getElementById('lastName');

let creatorMode = null;
let creatorTransitioning = false;
let wheelNameConfirmed = false;

let manualClass = null;
let manualBody = null;
let manualRole = null;
let manualNameConfirmed = false;

const manualClassText = {
    Warrior:'#17120d', Paladin:'#25111a', Hunter:'#15200f', Rogue:'#282400',
    Priest:'#171717', Shaman:'#ffffff', Mage:'#102027', Warlock:'#ffffff', Druid:'#211207'
};

const manualRoleDetails = {
    Tank:{icon:'🛡',copy:'Tank',className:'manual-role-tank'},
    Healer:{icon:'✚',copy:'Healer',className:'manual-role-healer'},
    DPS:{icon:'⚔',copy:'DPS',className:'manual-role-dps'}
};

function manualClassIcon(className) {
    return 'https://wow.zamimg.com/images/wow/icons/large/classicon_' +
        encodeURIComponent(String(className).toLowerCase()) + '.jpg';
}

function cleanForeverNamePart(value) {
    return String(value || '').trim();
}

function revealStep(element) {
    if (!element) return;
    element.hidden = false;
    requestAnimationFrame(() => {
        element.classList.add('is-visible');
        element.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
}

function hideStep(element) {
    if (!element) return;
    element.classList.remove('is-visible');
    element.hidden = true;
}

function resetManualProgression() {
    manualNameConfirmed = false;
    manualClass = null;
    manualBody = null;
    manualRole = null;

    hideStep(manualClassStep);
    hideStep(manualBodyStep);
    hideStep(manualRoleStep);
    hideStep(manualFinishStep);

    manualClassGrid.innerHTML = '';
    manualBodyGrid.innerHTML = '';
    manualRoleGrid.innerHTML = '';
    manualCreateButton.disabled = true;
    manualCreatorStatus.textContent = '';
}

function setSelectorState(mode) {
    manualModeButton.classList.toggle('active', mode === 'manual');
    wheelModeButton.classList.toggle('active', mode === 'wheel');
    manualModeButton.setAttribute('aria-pressed', String(mode === 'manual'));
    wheelModeButton.setAttribute('aria-pressed', String(mode === 'wheel'));
}

function showCreatorMode(mode) {
    creatorMode = mode;
    document.body.dataset.creatorStarted = 'true';
    document.body.dataset.creatorMode = mode;
    setSelectorState(mode);

    manualCreationMode.hidden = mode !== 'manual';
    wheelNameGate.hidden = mode !== 'wheel';

    manualCreationMode.style.display = mode === 'manual' ? 'block' : 'none';
    wheelNameGate.style.display = mode === 'wheel' ? 'block' : 'none';

    wheelBadLuckPanel.hidden = true;
    wheelCentrePanel.hidden = true;
    wheelBadLuckPanel.style.display = 'none';
    wheelCentrePanel.style.display = 'none';

    if (mode === 'manual') {
        creatorModeHeading.textContent = 'Create Your Forever Character';
        creatorModeDescription.textContent = 'Start with a name. We will handle the rest one decision at a time.';
        resetManualProgression();
        manualFirstName.focus();
    } else {
        creatorModeHeading.textContent = 'Leave It to the Gods';
        creatorModeDescription.textContent = 'Name the victim first. Fate comes next.';
        wheelNameConfirmed = false;
        wheelFirstName.disabled = false;
        wheelLastName.disabled = false;
        wheelFirstName.focus();
    }
}

function transitionToMode(mode) {
    if (creatorTransitioning) return;
    creatorTransitioning = true;

    manualModeButton.disabled = true;
    wheelModeButton.disabled = true;

    const dashboard = document.querySelector('.wheel-dashboard');
    if (dashboard) dashboard.classList.add('creator-dashboard-transitioning');

    window.setTimeout(() => {
        showCreatorMode(mode);
        if (dashboard) {
            dashboard.classList.remove('creator-dashboard-transitioning');
            dashboard.classList.add('creator-dashboard-entering');
            requestAnimationFrame(() => dashboard.classList.add('creator-dashboard-entering-active'));
        }

        window.setTimeout(() => {
            if (dashboard) dashboard.classList.remove('creator-dashboard-entering','creator-dashboard-entering-active');
            manualModeButton.disabled = false;
            wheelModeButton.disabled = false;
            creatorTransitioning = false;
            window.dispatchEvent(new Event('resize'));
        }, 320);
    }, 180);
}

/* =========================================================
   MANUAL MODE
========================================================= */

function renderManualClasses() {
    manualClassGrid.innerHTML = wheelClasses.map(info => `
        <button type="button" class="manual-class-button" data-manual-class="${info.name}"
            style="--manual-class:${info.colour};--manual-class-text:${manualClassText[info.name] || '#111'}">
            <img src="${manualClassIcon(info.name)}" alt="">
            <span>${info.name}</span>
        </button>
    `).join('');

    manualClassGrid.querySelectorAll('[data-manual-class]').forEach(button => {
        button.onclick = function() {
            manualClass = button.dataset.manualClass;
            manualBody = null;
            manualRole = null;

            manualClassGrid.querySelectorAll('.manual-class-button').forEach(b =>
                b.classList.toggle('selected', b === button));

            renderManualBodies();
            revealStep(manualBodyStep);
            hideStep(manualRoleStep);
            hideStep(manualFinishStep);
        };
    });
}

function renderManualBodies() {
    manualBodyGrid.innerHTML = bodyTypes.map(body => `
        <button type="button" class="manual-body-button body-${body.id}" data-manual-body="${body.id}">
            <strong>${body.name.toUpperCase()}</strong>
        </button>
    `).join('');

    manualBodyGrid.querySelectorAll('[data-manual-body]').forEach(button => {
        button.onclick = function() {
            manualBody = Number(button.dataset.manualBody);
            manualRole = null;

            manualBodyGrid.querySelectorAll('.manual-body-button').forEach(b =>
                b.classList.toggle('selected', b === button));

            renderManualRoles();
            revealStep(manualRoleStep);
            hideStep(manualFinishStep);
        };
    });
}

function renderManualRoles() {
    const validRoles = classRoles[manualClass] || ['DPS'];

    manualRoleGrid.innerHTML = ['Tank','Healer','DPS'].map(role => {
        const valid = validRoles.includes(role);
        const detail = manualRoleDetails[role];
        return `
            <button type="button" class="manual-role-button ${detail.className}" data-manual-role="${role}" ${valid ? '' : 'disabled'}>
                <span class="manual-role-icon">${detail.icon}</span>
                <span>${detail.copy}</span>
            </button>
        `;
    }).join('');

    manualRoleGrid.querySelectorAll('[data-manual-role]:not(:disabled)').forEach(button => {
        button.onclick = function() {
            manualRole = button.dataset.manualRole;

            manualRoleGrid.querySelectorAll('.manual-role-button').forEach(b =>
                b.classList.toggle('selected', b === button));

            updateManualSummary();
            revealStep(manualFinishStep);
        };
    });
}

function updateManualSummary() {
    const first = cleanForeverNamePart(manualFirstName.value);
    const last = cleanForeverNamePart(manualLastName.value);
    const valid = first.length >= 2 && last.length >= 2 && manualClass && manualBody && manualRole;

    manualCreateButton.disabled = !valid;

    if (valid) {
        manualCreatorStatus.textContent =
            `${first} ${last} • ${manualClass} • Body Type ${manualBody} • ${manualRole}`;
    } else {
        manualCreatorStatus.textContent = '';
    }
}

manualConfirmName.onclick = function() {
    const first = cleanForeverNamePart(manualFirstName.value);
    const last = cleanForeverNamePart(manualLastName.value);

    if (first.length < 2 || last.length < 2) {
        manualConfirmName.textContent = 'ENTER FIRST + LAST NAME';
        window.setTimeout(() => manualConfirmName.textContent = 'CONTINUE', 1400);
        return;
    }

    manualNameConfirmed = true;
    manualFirstName.disabled = true;
    manualLastName.disabled = true;
    manualConfirmName.textContent = '✓ NAME LOCKED';

    renderManualClasses();
    revealStep(manualClassStep);
};

manualCreateButton.onclick = async function() {
    const first = cleanForeverNamePart(manualFirstName.value);
    const last = cleanForeverNamePart(manualLastName.value);
    updateManualSummary();

    if (manualCreateButton.disabled) return;

    manualCreateButton.disabled = true;
    manualCreateButton.textContent = 'REGISTERING…';

    setManualResult(first,last,manualClass,manualRole,manualBody);
    const saved = await saveRoll(first,last,manualClass,manualBody,manualRole);

    if (saved) {
        manualCreatorStatus.textContent = `${saved.character_name} registered as Trial.`;
        document.querySelector('.progression-rail')?.scrollIntoView({behavior:'smooth',block:'center'});
    } else {
        manualCreatorStatus.textContent = 'Save failed. Character was not confirmed.';
    }

    manualCreateButton.textContent = 'CREATE TRIAL CHARACTER';
    updateManualSummary();
};

function setManualResult(first,last,className,role,body) {
    const info = wheelClasses.find(item => item.name === className);
    const bodyInfo = bodyTypes.find(item => item.id === body);
    const resultName = document.getElementById('wheelResultName');
    const resultClass = document.getElementById('wheelResultClass');
    const resultBody = document.getElementById('wheelResultBody');
    const resultRole = document.getElementById('wheelResultRole');
    const resultMessage = document.getElementById('wheelResultMessage');

    resultName.textContent = `${first} ${last}`;
    resultName.style.color = info ? info.colour : '#e7ded1';
    resultClass.textContent = className;
    resultClass.style.color = info ? info.colour : '#d7a94b';
    resultBody.style.display = 'inline-block';
    resultBody.textContent = bodyInfo ? bodyInfo.name : `Body Type ${body}`;
    resultBody.style.background = bodyInfo ? bodyInfo.colour : '#333';
    resultRole.style.display = 'inline-block';
    resultRole.textContent = role;
    resultMessage.textContent = 'Character registered.';
}

/* =========================================================
   WHEEL MODE
========================================================= */

wheelConfirmName.onclick = function() {
    const first = cleanForeverNamePart(wheelFirstName.value);
    const last = cleanForeverNamePart(wheelLastName.value);

    if (first.length < 2 || last.length < 2) {
        wheelConfirmName.textContent = 'ENTER FIRST + LAST NAME';
        window.setTimeout(() => wheelConfirmName.textContent = 'CONTINUE TO THE WHEEL', 1400);
        return;
    }

    wheelNameConfirmed = true;
    wheelFirstName.disabled = true;
    wheelLastName.disabled = true;
    wheelConfirmName.textContent = '✓ FATE ACCEPTED';

    wheelNameGate.classList.add('step-completing');

    window.setTimeout(() => {
        wheelNameGate.hidden = true;
        wheelNameGate.style.display = 'none';

        wheelBadLuckPanel.hidden = false;
        wheelCentrePanel.hidden = false;
        wheelBadLuckPanel.style.display = 'block';
        wheelCentrePanel.style.display = 'flex';

        wheelBadLuckPanel.classList.add('creator-face-entering');
        wheelCentrePanel.classList.add('creator-face-entering');
        requestAnimationFrame(() => {
            wheelBadLuckPanel.classList.add('creator-face-entering-active');
            wheelCentrePanel.classList.add('creator-face-entering-active');
        });

        window.setTimeout(() => {
            wheelBadLuckPanel.classList.remove('creator-face-entering','creator-face-entering-active');
            wheelCentrePanel.classList.remove('creator-face-entering','creator-face-entering-active');
            window.dispatchEvent(new Event('resize'));
        }, 320);
    }, 220);
};

/* =========================================================
   MODE SELECTION
========================================================= */

manualModeButton.onclick = () => transitionToMode('manual');
wheelModeButton.onclick = () => transitionToMode('wheel');

/* Start with only the two fate choices visible. */
document.body.dataset.creatorStarted = 'false';
document.body.dataset.creatorMode = 'none';
manualCreationMode.hidden = true;
wheelNameGate.hidden = true;
wheelBadLuckPanel.hidden = true;
wheelCentrePanel.hidden = true;
manualCreationMode.style.display = 'none';
wheelNameGate.style.display = 'none';
wheelBadLuckPanel.style.display = 'none';
wheelCentrePanel.style.display = 'none';

creatorModeHeading.textContent = 'Hey! How are we making this character?';
creatorModeDescription.textContent = 'Create it yourself, or leave it up to the gods.';
setSelectorState(null);
