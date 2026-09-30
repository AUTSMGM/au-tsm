/* =========================================================
   CHARACTER CREATION MODE SWITCHER / MANUAL CREATOR
========================================================= */

const manualModeButton = document.getElementById('manualModeButton');
const wheelModeButton = document.getElementById('wheelModeButton');
const manualCreationMode = document.getElementById('manualCreationMode');
const wheelBadLuckPanel = document.getElementById('wheelBadLuckPanel');
const wheelCentrePanel = document.getElementById('wheelCentrePanel');
const creatorModeHeading = document.getElementById('creatorModeHeading');
const creatorModeDescription = document.getElementById('creatorModeDescription');

const manualFirstName = document.getElementById('manualFirstName');
const manualLastName = document.getElementById('manualLastName');
const manualClassGrid = document.getElementById('manualClassGrid');
const manualRoleGrid = document.getElementById('manualRoleGrid');
const manualBodyGrid = document.getElementById('manualBodyGrid');
const manualCreateButton = document.getElementById('manualCreateButton');
const manualCreatorStatus = document.getElementById('manualCreatorStatus');

let creatorMode = 'manual';
let manualClass = null;
let manualRole = null;
let manualBody = null;

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

function setCreatorMode(mode) {
    creatorMode = mode === 'wheel' ? 'wheel' : 'manual';
    const wheelActive = creatorMode === 'wheel';

    document.body.dataset.creatorMode = creatorMode;

    manualCreationMode.hidden = wheelActive;
    wheelBadLuckPanel.hidden = !wheelActive;
    wheelCentrePanel.hidden = !wheelActive;

    manualModeButton.classList.toggle('active', !wheelActive);
    wheelModeButton.classList.toggle('active', wheelActive);
    manualModeButton.setAttribute('aria-pressed', String(!wheelActive));
    wheelModeButton.setAttribute('aria-pressed', String(wheelActive));

    if (wheelActive) {
        creatorModeHeading.textContent = 'Which Class Will You Roll? (Spin)';
        creatorModeDescription.textContent = 'Enter your Forever name, spend up to three protection tokens, then surrender your future.';
    } else {
        creatorModeHeading.textContent = 'Create Your Forever Character';
        creatorModeDescription.textContent = 'Choose the character you actually want. Responsibility for the outcome is now entirely yours.';
    }
}

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
            manualRole = null;
            manualClassGrid.querySelectorAll('.manual-class-button').forEach(b =>
                b.classList.toggle('selected', b === button));
            renderManualRoles();
            updateManualCreateState();
        };
    });
}

function renderManualRoles() {
    if (!manualClass) {
        manualRoleGrid.innerHTML = '<div class="manual-empty-choice">Choose a class first.</div>';
        return;
    }

    const validRoles = classRoles[manualClass] || ['DPS'];
    manualRoleGrid.innerHTML = ['Tank','Healer','DPS'].map(role => {
        const valid = validRoles.includes(role);
        const detail = manualRoleDetails[role];
        return `
            <button type="button" class="manual-role-button ${detail.className}" data-manual-role="${role}" ${valid ? '' : 'disabled'}>
                <span class="manual-role-icon">${detail.icon}</span>
                <span>${detail.copy}</span>
                ${valid ? '' : '<small>Unavailable</small>'}
            </button>
        `;
    }).join('');

    manualRoleGrid.querySelectorAll('[data-manual-role]:not(:disabled)').forEach(button => {
        button.onclick = function() {
            manualRole = button.dataset.manualRole;
            manualRoleGrid.querySelectorAll('.manual-role-button').forEach(b =>
                b.classList.toggle('selected', b === button));
            updateManualCreateState();
        };
    });
}

function renderManualBodies() {
    manualBodyGrid.innerHTML = bodyTypes.map(body => `
        <button type="button" class="manual-body-button body-${body.id}" data-manual-body="${body.id}">
            <strong>${body.name.toUpperCase()}</strong>
            <span>${body.id === 1 ? 'BLUE' : 'PINK'}</span>
        </button>
    `).join('');

    manualBodyGrid.querySelectorAll('[data-manual-body]').forEach(button => {
        button.onclick = function() {
            manualBody = Number(button.dataset.manualBody);
            manualBodyGrid.querySelectorAll('.manual-body-button').forEach(b =>
                b.classList.toggle('selected', b === button));
            updateManualCreateState();
        };
    });
}

function cleanForeverNamePart(value) {
    return String(value || '').trim();
}

function updateManualCreateState() {
    const first = cleanForeverNamePart(manualFirstName.value);
    const last = cleanForeverNamePart(manualLastName.value);
    const valid = first.length >= 2 && last.length >= 2 && manualClass && manualRole && manualBody;
    manualCreateButton.disabled = !valid;

    if (!first || !last) manualCreatorStatus.textContent = 'Enter a Forever first and last name.';
    else if (!manualClass) manualCreatorStatus.textContent = 'Choose a class.';
    else if (!manualRole) manualCreatorStatus.textContent = 'Choose a valid role for ' + manualClass + '.';
    else if (!manualBody) manualCreatorStatus.textContent = 'Choose a body type.';
    else manualCreatorStatus.textContent = `${first} ${last} • ${manualClass} • ${manualRole} • Body Type ${manualBody}`;
}

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
    resultMessage.textContent = 'Character created manually. Any consequences are now entirely self-inflicted.';
}

manualCreateButton.onclick = async function() {
    const first = cleanForeverNamePart(manualFirstName.value);
    const last = cleanForeverNamePart(manualLastName.value);
    updateManualCreateState();
    if (manualCreateButton.disabled) return;

    manualCreateButton.disabled = true;
    manualCreateButton.textContent = 'REGISTERING WITH GUILD BUREAUCRACY…';
    manualCreatorStatus.textContent = 'Saving Trial character…';

    setManualResult(first,last,manualClass,manualRole,manualBody);
    const saved = await saveRoll(first,last,manualClass,manualBody,manualRole);

    if (saved) {
        manualCreatorStatus.textContent = `${saved.character_name} registered as Trial. Raid Ready Test unlocked.`;
        document.querySelector('.wheel-result-row')?.scrollIntoView({behavior:'smooth',block:'center'});
    } else {
        manualCreatorStatus.textContent = 'Save failed. Character was not confirmed.';
    }

    manualCreateButton.textContent = 'CREATE TRIAL CHARACTER';
    updateManualCreateState();
};

manualFirstName.addEventListener('input', updateManualCreateState);
manualLastName.addEventListener('input', updateManualCreateState);
manualModeButton.onclick = () => setCreatorMode('manual');
wheelModeButton.onclick = () => setCreatorMode('wheel');

renderManualClasses();
renderManualRoles();
renderManualBodies();
updateManualCreateState();
setCreatorMode('manual');
