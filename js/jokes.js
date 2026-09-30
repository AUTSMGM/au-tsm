/* =========================================================
   SITE JOKES
========================================================= */

const deathReports =
[

    "Roks stood in fire.",

    "Aimless confidently travelled in the wrong direction.",

    "Luffa attempted mechanics after beverage number four.",

    "KP pulled before the ready check completed.",

    "Chris died. Investigation concluded healer error.",

    "Fayne died while Bladestorming."

];


const blameTargets =
[

    "Roks",

    "Australian internet",

    "The healer",

    "Phinky's strategy",

    "Lag",

    "Fayne's Bladestorm",

    "Definitely not Chris"

];


const leadershipStatuses =
[

    "Phinky pretending everything is under control.",

    "Phinky reviewing a spreadsheet nobody requested.",

    "Chris has begun providing strategic oversight.",

    "Officer meeting currently replacing actual gameplay."

];


setInterval(
    function() {

        document
        .getElementById(
            "latestDeath"
        )
        .textContent =
            randomItem(
                deathReports
            );


        document
        .getElementById(
            "blameTarget"
        )
        .textContent =
            randomItem(
                blameTargets
            );


        document
        .getElementById(
            "leadershipStatus"
        )
        .textContent =
            randomItem(
                leadershipStatuses
            );

    },
    9000
);


/* =========================================================
   FAYNE
========================================================= */

const fayneStatuses =
[

    "Ready — Bladestorm available",

    "Bladestorming",

    "Still Bladestorming",

    "Mechanic detected — continuing Bladestorm",

    "Excellent damage",

    "Mechanic failed",

    "\"Yeah but look at my damage\""

];


let fayneIndex =
    0;


setInterval(
    function() {

        fayneIndex =
            (
                fayneIndex +
                1
            )
            %
            fayneStatuses.length;


        document
        .getElementById(
            "fayneStatus"
        )
        .textContent =
            fayneStatuses[
                fayneIndex
            ];

    },
    2500
);


/* =========================================================
   OTHER BUTTONS
========================================================= */

document
.getElementById(
    "joinButton"
)
.onclick =
function() {

    queueSound(
        levelUpSound
    );


    showToast(
        "Application submitted. Phinky will review it sometime between now and Wrath."
    );

};


const readyButton =
    document.getElementById(
        "readyButton"
    );


let readyCooldown =
    false;


readyButton.onclick =
    function() {

        if (
            readyCooldown
        ) {

            return;

        }


        readyCooldown =
            true;


        readyButton.disabled =
            true;


        queueSound(
            readyCheckSound
        );


        let remaining =
            5;


        const timer =
            setInterval(
                function() {

                    remaining--;


                    readyButton.textContent =
                        remaining >
                        0
                        ?
                        "Cooldown: "
                        +
                        remaining
                        +
                        "s"
                        :
                        "Initiate Ready Check";


                    if (
                        remaining <=
                        0
                    ) {

                        clearInterval(
                            timer
                        );


                        readyCooldown =
                            false;


                        readyButton.disabled =
                            false;

                    }

                },
                1000
            );

    };


document
.getElementById(
    "eligibilityButton"
)
.onclick =
function() {

    document
    .getElementById(
        "eligibilityResult"
    )
    .textContent =
        randomItem([
            "ELIGIBLE — barely.",
            "REJECTED — Roks-level mechanic history.",
            "ELIGIBLE — standards have been lowered.",
            "MANUAL REVIEW — suspicious competence detected."
        ]);

};


document
.getElementById(
    "latencyButton"
)
.onclick =
function() {

    document
    .getElementById(
        "latencyResult"
    )
    .textContent =
        randomNumber(
            30,
            170
        )
        +
        " ms — sufficient evidence to blame Australia.";

};


document
.getElementById(
    "lootButton"
)
.onclick =
function() {

    document
    .getElementById(
        "lootResult"
    )
    .textContent =
        randomItem([
            "Priority: PHINKY.",
            "Priority: LOW — Chris needs it.",
            "DENIED — reserved for someone's alt.",
            "Decision expected within 6–8 raid tiers."
        ]);

};


document
.getElementById(
    "parseButton"
)
.onclick =
function() {

    document
    .getElementById(
        "parseResult"
    )
    .textContent =
        randomItem([
            "Press your buttons harder.",
            "Stop standing next to Roks.",
            "Bladestorm harder. Fayne approved.",
            "Replace all gear for a theoretical 0.2% gain."
        ]);

};
