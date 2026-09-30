function getValidRoleForClass(className) {

    const validRoles =
        getAvailableRolesForClass(
            className
        );


    return validRoles.length
        ?
        randomItem(
            validRoles
        )
        :
        null;

}



const wheelMessages =
[

    "The wheel has spoken. Any reroll before level 20 will be investigated.",

    "Character planning successfully outsourced to JavaScript.",

    "The decision is final unless Phinky changes the rules.",

    "Time to spend six hours choosing your professions.",

    "AU TSM analytics confirm this was probably a mistake.",

    "Your fate is sealed. Please update the spreadsheet.",

    "Excellent. Now immediately start researching an alt.",

    "Roks recommends ignoring the result completely.",

    "Chris has reviewed your result and believes he would play it better."

];


const classWheel =
    document.getElementById(
        "classWheel"
    );

const wheelPointer =
    document.getElementById(
        "wheelPointer"
    );

const wheelDisabledMask =
    document.getElementById(
        "wheelDisabledMask"
    );

const spinWheelButton =
    document.getElementById(
        "spinWheelButton"
    );

const leverMachine =
    document.getElementById(
        "leverMachine"
    );

const bodySlotTrack =
    document.getElementById(
        "bodySlotTrack"
    );

const roleDoor =
    document.getElementById(
        "roleDoor"
    );

const roleDoorQuestion =
    document.getElementById(
        "roleDoorQuestion"
    );

const roleDoorResult =
    document.getElementById(
        "roleDoorResult"
    );

const firstNameInput =
    document.getElementById(
        "firstName"
    );

const lastNameInput =
    document.getElementById(
        "lastName"
    );


let wheelSpinning =
    false;


let wheelRotation =
    0;


let tokensUsed =
    0;


const MAX_TOKENS =
    3;


const disabledClasses =
    new Set();


const disabledBodies =
    new Set();


const disabledRoles =
    new Set();


const roleTokenCosts =
{
    Tank: 1,
    Healer: 1,
    DPS: 3
};


function getAvailableRolesForClass(className) {

    const roles =
        classRoles[className]
        ||
        ["DPS"];


    return roles.filter(
        function(role) {

            return !disabledRoles.has(
                role
            );

        }
    );

}


/* =========================================================
   PROTECTION
========================================================= */

function updateProtectionDisplay() {

    document
    .getElementById(
        "tokensRemaining"
    )
    .textContent =
        (
            MAX_TOKENS -
            tokensUsed
        )
        +
        " / "
        +
        MAX_TOKENS;


    document
    .querySelectorAll(
        "[data-class-name]"
    )
    .forEach(
        function(button) {

            button
            .classList
            .toggle(
                "excluded",
                disabledClasses.has(
                    button.dataset.className
                )
            );

        }
    );


    document
    .querySelectorAll(
        "[data-wheel-class]"
    )
    .forEach(
        function(label) {

            label
            .classList
            .toggle(
                "disabled-label",
                disabledClasses.has(
                    label.dataset.wheelClass
                )
            );

        }
    );


    document
    .querySelectorAll(
        "[data-body-type]"
    )
    .forEach(
        function(button) {

            button
            .classList
            .toggle(
                "excluded",
                disabledBodies.has(
                    Number(
                        button.dataset.bodyType
                    )
                )
            );

        }
    );


    document
    .querySelectorAll(
        "[data-role-name]"
    )
    .forEach(
        function(button) {

            button
            .classList
            .toggle(
                "excluded",
                disabledRoles.has(
                    button.dataset.roleName
                )
            );

        }
    );


    const maskPieces =
        [];


    wheelClasses.forEach(
        function(
            classInfo,
            index
        ) {

            const start =
                index *
                40;


            const end =
                start +
                40;


            maskPieces.push(

                (
                    (
                        disabledClasses.has(
                            classInfo.name
                        )
                        ||
                        getAvailableRolesForClass(
                            classInfo.name
                        ).length === 0
                    )
                    ?
                    "rgba(0,0,0,.72)"
                    :
                    "transparent"
                )
                +
                " "
                +
                start
                +
                "deg "
                +
                end
                +
                "deg"

            );

        }
    );


    wheelDisabledMask.style.background =
        "conic-gradient(from -20deg,"
        +
        maskPieces.join(
            ","
        )
        +
        ")";

}


function protectionMessage(text) {

    const warning =
        document.getElementById(
            "protectionWarning"
        );


    warning.textContent =
        text;


    setTimeout(
        function() {

            if (
                warning.textContent ===
                text
            ) {

                warning.textContent =
                    "";

            }

        },
        2400
    );

}


document
.querySelectorAll(
    "[data-class-name]"
)
.forEach(
    function(button) {

        button.onclick =
            function() {

                if (
                    wheelSpinning
                ) {

                    return;

                }


                const name =
                    button.dataset.className;


                if (
                    disabledClasses.has(
                        name
                    )
                ) {

                    disabledClasses.delete(
                        name
                    );


                    tokensUsed--;


                    updateProtectionDisplay();


                    return;

                }


                if (
                    tokensUsed >=
                    MAX_TOKENS
                ) {

                    protectionMessage(
                        "No protection tokens remaining."
                    );


                    return;

                }


                disabledClasses.add(
                    name
                );


                tokensUsed++;


                const classesStillPossible =
                    wheelClasses.some(
                        function(classInfo) {

                            return !disabledClasses.has(
                                classInfo.name
                            )
                            &&
                            getAvailableRolesForClass(
                                classInfo.name
                            ).length > 0;

                        }
                    );


                if (
                    !classesStillPossible
                ) {

                    disabledClasses.delete(
                        name
                    );


                    tokensUsed--;


                    protectionMessage(
                        "That would leave no legal class/role result."
                    );


                    return;

                }


                updateProtectionDisplay();

            };

    }
);


document
.querySelectorAll(
    "[data-body-type]"
)
.forEach(
    function(button) {

        button.onclick =
            function() {

                if (
                    wheelSpinning
                ) {

                    return;

                }


                const id =
                    Number(
                        button.dataset.bodyType
                    );


                if (
                    disabledBodies.has(
                        id
                    )
                ) {

                    disabledBodies.delete(
                        id
                    );


                    tokensUsed--;


                    updateProtectionDisplay();


                    return;

                }


                if (
                    disabledBodies.size >=
                    1
                ) {

                    protectionMessage(
                        "At least one body type must remain available."
                    );


                    return;

                }


                if (
                    tokensUsed >=
                    MAX_TOKENS
                ) {

                    protectionMessage(
                        "No protection tokens remaining."
                    );


                    return;

                }


                disabledBodies.add(
                    id
                );


                tokensUsed++;


                updateProtectionDisplay();

            };

    }
);


/* =========================================================
   ROLE EXCLUSIONS
========================================================= */

document
.querySelectorAll(
    "[data-role-name]"
)
.forEach(
    function(button) {

        button.onclick =
            function() {

                if (
                    wheelSpinning
                ) {

                    return;

                }


                const role =
                    button.dataset.roleName;


                const cost =
                    roleTokenCosts[role]
                    ||
                    1;


                if (
                    disabledRoles.has(
                        role
                    )
                ) {

                    disabledRoles.delete(
                        role
                    );


                    tokensUsed -=
                        cost;


                    updateProtectionDisplay();


                    protectionMessage(
                        role +
                        " restored. " +
                        cost +
                        (cost === 1 ? " token refunded." : " tokens refunded.")
                    );


                    return;

                }


                if (
                    tokensUsed +
                    cost >
                    MAX_TOKENS
                ) {

                    protectionMessage(
                        role === "DPS"
                        ?
                        "Blocking DPS costs all 3 tokens. Refund your other choices first."
                        :
                        "Not enough protection tokens remaining."
                    );


                    return;

                }


                disabledRoles.add(
                    role
                );


                tokensUsed +=
                    cost;


                /* Never allow a configuration that removes every class. */
                const classesStillPossible =
                    wheelClasses.some(
                        function(classInfo) {

                            return !disabledClasses.has(
                                classInfo.name
                            )
                            &&
                            getAvailableRolesForClass(
                                classInfo.name
                            ).length > 0;

                        }
                    );


                if (
                    !classesStillPossible
                ) {

                    disabledRoles.delete(
                        role
                    );


                    tokensUsed -=
                        cost;


                    protectionMessage(
                        "That would leave no legal class/role result."
                    );


                    return;

                }


                updateProtectionDisplay();


                protectionMessage(
                    role +
                    " blocked for " +
                    cost +
                    (cost === 1 ? " token." : " tokens.")
                );

            };

    }
);


/* =========================================================
   POINTER
========================================================= */

function tickWheelPointer() {

    wheelPointer
    .classList
    .remove(
        "ticking"
    );


    void wheelPointer.offsetWidth;


    wheelPointer
    .classList
    .add(
        "ticking"
    );

}


/* =========================================================
   BODY SLOT
========================================================= */

function spinBodySlot(
    winnerId
) {

    const matchingIndexes =
        winnerId ===
        1
        ?
        [6,8,10]
        :
        [7,9,11];


    const targetIndex =
        randomItem(
            matchingIndexes
        );


    bodySlotTrack.style.transition =
        "none";


    bodySlotTrack.style.transform =
        "translateY(0px)";


    void bodySlotTrack.offsetWidth;


    bodySlotTrack.style.transition =
        "transform 5.8s cubic-bezier(.10,.70,.10,1)";


    bodySlotTrack.style.transform =
        "translateY(-"
        +
        (
            targetIndex *
            bodySlotTrack.firstElementChild.getBoundingClientRect().height
        )
        +
        "px)";

}


/* =========================================================
   ROLE DOOR
========================================================= */

function resetRoleDoor() {

    roleDoor.classList.remove(
        "revealed",
        "checking"
    );


    roleDoor.removeAttribute(
        "data-role"
    );


    roleDoorQuestion.textContent =
        "?";


    roleDoorResult.textContent =
        "?";


    const resultRole =
        document.getElementById(
            "wheelResultRole"
        );


    resultRole.style.display =
        "none";


    resultRole.textContent =
        "?";

}


function beginRoleValidation() {

    /* Keep the door closed and neutral after the wheel stops.
       The final role is revealed a moment later without showing
       a temporary "CHECKING..." label that does not fit the panel. */
    roleDoor.classList.remove(
        "revealed",
        "checking"
    );


    roleDoor.removeAttribute(
        "data-role"
    );


    roleDoorQuestion.textContent =
        "?";


    roleDoorResult.textContent =
        "?";

}


function revealRole(role) {

    roleDoor.classList.remove(
        "checking"
    );


    roleDoor.setAttribute(
        "data-role",
        role
    );


    roleDoorResult.textContent =
        role;


    roleDoor.classList.add(
        "revealed"
    );


    const resultRole =
        document.getElementById(
            "wheelResultRole"
        );


    resultRole.textContent =
        role;


    resultRole.style.display =
        "inline-block";


    if (
        role ===
        "Tank"
    ) {
        resultRole.style.color = "#8ec8ff";
        resultRole.style.borderColor = "#416f96";
    }
    else if (
        role ===
        "Healer"
    ) {
        resultRole.style.color = "#86e18c";
        resultRole.style.borderColor = "#477d4b";
    }
    else {
        resultRole.style.color = "#ff9b81";
        resultRole.style.borderColor = "#8f4a3b";
    }

}


/* =========================================================
   SPIN
========================================================= */

spinWheelButton.onclick =
    function() {

        if (
            wheelSpinning
        ) {

            return;

        }


        const firstName =
            firstNameInput
            .value
            .trim();

        const lastName =
            lastNameInput
            .value
            .trim();

        const characterName =
            (firstName + " " + lastName)
            .trim();


        if (
            firstName.length < 2
            ||
            lastName.length < 2
        ) {

            protectionMessage(
                "Enter both your Forever first name and last name before pulling the lever."
            );

            if (
                firstName.length < 2
            ) {
                firstNameInput.focus();
            }
            else {
                lastNameInput.focus();
            }

            return;

        }


        const availableClasses =
            wheelClasses.filter(
                function(classInfo) {

                    return !disabledClasses.has(
                        classInfo.name
                    )
                    &&
                    getAvailableRolesForClass(
                        classInfo.name
                    ).length > 0;

                }
            );


        if (
            availableClasses.length ===
            0
        ) {

            protectionMessage(
                "No legal class/role combinations remain. Refund a protection choice."
            );


            return;

        }


        const availableBodies =
            bodyTypes.filter(
                function(bodyInfo) {

                    return !disabledBodies.has(
                        bodyInfo.id
                    );

                }
            );


        const winningClass =
            randomItem(
                availableClasses
            );


        const winningBody =
            randomItem(
                availableBodies
            );


        setCharacter(null,'The wheel is choosing your character…');
        wheelSpinning =
            true;


        spinWheelButton.disabled =
            true;


        firstNameInput.disabled =
            true;

        lastNameInput.disabled =
            true;


        document
        .querySelectorAll(
            ".exclusion-button"
        )
        .forEach(
            function(button) {

                button.disabled =
                    true;

            }
        );


        spinWheelButton.textContent =
            "SPINNING";


        leverMachine.classList.add(
            "pulled"
        );


        document
        .getElementById(
            "wheelResultName"
        )
        .textContent =
            characterName;


        document
        .getElementById(
            "wheelResultClass"
        )
        .textContent =
            "...";


        document
        .getElementById(
            "wheelResultBody"
        )
        .style.display =
            "none";


        document
        .getElementById(
            "wheelResultMessage"
        )
        .textContent =
            "Consulting the ancient algorithm...";


        resetRoleDoor();


        spinBodySlot(
            winningBody.id
        );


        const winnerIndex =
            wheelClasses
            .findIndex(
                function(classInfo) {

                    return classInfo.name ===
                        winningClass.name;

                }
            );


        const targetPosition =
            (
                360 -
                (
                    winnerIndex *
                    40
                )
            )
            %
            360;


        const currentNormal =
            (
                (
                    wheelRotation %
                    360
                )
                +
                360
            )
            %
            360;


        const extraDistance =
            (
                targetPosition
                -
                currentNormal
                +
                360
            )
            %
            360;


        wheelRotation +=
            (
                randomNumber(
                    6,
                    9
                )
                *
                360
            )
            +
            extraDistance;


        classWheel.style.transform =
            "rotate("
            +
            wheelRotation
            +
            "deg)";


        let tickerActive =
            true;


        let tickDelay =
            75;


        function ticker() {

            if (
                !tickerActive
            ) {

                return;

            }


            tickWheelPointer();


            tickDelay +=
                9;


            setTimeout(
                ticker,
                Math.min(
                    tickDelay,
                    360
                )
            );

        }


        ticker();


        setTimeout(
            function() {

                leverMachine
                .classList
                .remove(
                    "pulled"
                );

            },
            500
        );


        setTimeout(
            async function() {

                tickerActive =
                    false;


                beginRoleValidation();


                /* Keep the lever label visually stable while the role door resolves. */
                spinWheelButton.textContent =
                    "PULL";


                const resultClass =
                    document.getElementById(
                        "wheelResultClass"
                    );


                const resultBody =
                    document.getElementById(
                        "wheelResultBody"
                    );


                resultClass.textContent =
                    winningClass.name;


                resultClass.style.color =
                    winningClass.colour;


                const resultName =
                    document.getElementById(
                        "wheelResultName"
                    );


                resultName.style.color =
                    winningClass.colour;


                resultBody.style.display =
                    "inline-block";


                resultBody.textContent =
                    winningBody.name;


                resultBody.style.background =
                    winningBody.colour;


                const winningRole =
                    getValidRoleForClass(
                        winningClass.name
                    );


                document
                .getElementById(
                    "wheelResultMessage"
                )
                .textContent =
                    "Class validated. Determining a legal role...";


                setTimeout(
                    async function() {

                        revealRole(
                            winningRole
                        );


                        document
                        .getElementById(
                            "wheelResultMessage"
                        )
                        .textContent =
                            randomItem(
                                wheelMessages
                            );


                        await saveRoll(
                            firstName,
                            lastName,
                            winningClass.name,
                            winningBody.id,
                            winningRole
                        );

                        wheelSpinning =
                            false;


                        spinWheelButton.disabled =
                            false;


                        firstNameInput.disabled =
                            false;

                        lastNameInput.disabled =
                            false;


                        document
                        .querySelectorAll(
                            ".exclusion-button"
                        )
                        .forEach(
                            function(button) {

                                button.disabled =
                                    false;

                            }
                        );


                        spinWheelButton.textContent =
                            "PULL";




                    },
                    700
                );

            },
            6350
        );

    };



/* =========================================================
   KEEP WHEEL CLASS ICONS / LABELS UPRIGHT WHILE SPINNING
========================================================= */

const uprightWheelLabels = Array.from(
    document.querySelectorAll("#classWheel .wheel-label")
);

let uprightWheelLabelFrame = null;
let uprightWheelTrackingUntil = 0;

function getRenderedWheelRotation() {
    const transform = window.getComputedStyle(classWheel).transform;

    if (!transform || transform === "none") {
        return 0;
    }

    const match = transform.match(/^matrix\(([^)]+)\)$/);

    if (match) {
        const values = match[1].split(",").map(Number);
        const a = values[0];
        const b = values[1];
        return Math.atan2(b, a) * 180 / Math.PI;
    }

    const match3d = transform.match(/^matrix3d\(([^)]+)\)$/);

    if (match3d) {
        const values = match3d[1].split(",").map(Number);
        const a = values[0];
        const b = values[1];
        return Math.atan2(b, a) * 180 / Math.PI;
    }

    return 0;
}

function updateUprightWheelLabels() {
    const renderedRotation = getRenderedWheelRotation();
    const radius = Math.max(60, classWheel.clientWidth / 2 - 52);

    uprightWheelLabels.forEach(function(label, index) {
        const segmentAngle = index * 40;

        label.style.transform =
            "rotate(" + segmentAngle + "deg) " +
            "translateY(-" + radius + "px) " +
            "rotate(" + (-(segmentAngle + renderedRotation)) + "deg)";
    });
}

function trackUprightWheelLabels(duration = 6800) {
    uprightWheelTrackingUntil = performance.now() + duration;

    if (uprightWheelLabelFrame) {
        cancelAnimationFrame(uprightWheelLabelFrame);
    }

    function frame() {
        updateUprightWheelLabels();

        if (performance.now() < uprightWheelTrackingUntil) {
            uprightWheelLabelFrame = requestAnimationFrame(frame);
        } else {
            uprightWheelLabelFrame = null;
            updateUprightWheelLabels();
        }
    }

    frame();
}

/* Initialise labels in their upright resting positions. */
requestAnimationFrame(updateUprightWheelLabels);

/*
Watch the wheel's inline transform. Every spin changes that property,
so this automatically begins counter-rotation tracking without changing
the existing spin-selection logic.
*/
const uprightWheelObserver = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
        if (
            mutation.type === "attributes" &&
            mutation.attributeName === "style"
        ) {
            trackUprightWheelLabels(6800);
            break;
        }
    }
});

uprightWheelObserver.observe(classWheel, {
    attributes: true,
    attributeFilter: ["style"]
});

/* Recalculate the safe label radius if the viewport changes. */
window.addEventListener("resize", function() {
    requestAnimationFrame(updateUprightWheelLabels);
});
