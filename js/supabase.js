/* =========================================================
   DATABASE / LAST 30
========================================================= */

let recentRolls =
    [];


const databaseStatus =
    document.getElementById(
        "databaseStatus"
    );


async function loadRecentRolls() {
    if (!database) { databaseStatus.textContent = 'DATABASE UNAVAILABLE'; return; }
    try {
        const {data,error} = await database.from('guild_rolls').select('id, character_name, first_name, last_name, class_name, body_type, role, guild_rank, application_status, roster_active, discord_name, raid_ready_at, created_at').order('created_at',{ascending:false}).limit(30);
        if(error) throw error;
        recentRolls=data || [];
        databaseStatus.textContent='LIVE • '+recentRolls.length+'/30';
        renderRollHistory(); updateClassDistribution();
    } catch(error) { console.error(error); databaseStatus.textContent='SYNC FAILED — CHECK CONNECTION / TABLE PERMISSIONS'; }
}

/* =========================================================
   SAVE ROLL
========================================================= */

async function saveRoll(firstName,lastName,className,bodyType,role) {
    const payload={character_name:(firstName+' '+lastName).trim(),first_name:firstName,last_name:lastName,class_name:className,body_type:bodyType,role,guild_rank:'Trial'};
    setCharacter(null,'Saving character…');
    try {
        if(!database) throw Error('Database unavailable');
        const {data,error}=await database.from('guild_rolls').insert([payload]).select().single();
        if(error) throw error;
        if(!data || data.id == null) throw Error('Database did not return a saved row ID');
        setCharacter(data);
        await loadRecentRolls();
        return data;
    } catch(error) {
        console.error(error);
        setCharacter(null,'Save not confirmed. Check your connection and recent rolls before spinning again.');
        showToast('Character save could not be confirmed. Raid test is locked.');
        return null;
    }
}

/* =========================================================
   RENDER HISTORY
========================================================= */

function renderRollHistory() {

    const container =
        document.getElementById(
            "rollHistory"
        );

    if (
        recentRolls.length ===
        0
    ) {

        container.innerHTML =
            `
            <div class="empty-history">
            No shared rolls recorded yet.
            </div>
            `;
        return;
    }

    const classColours =
    {
        Warrior: "#C79C6E",
        Paladin: "#F58CBA",
        Hunter: "#ABD473",
        Rogue: "#FFF569",
        Priest: "#FFFFFF",
        Shaman: "#0070DE",
        Mage: "#69CCF0",
        Warlock: "#9482C9",
        Druid: "#FF7D0A"
    };

    const roleIcons =
    {
        Tank: "🛡",
        Healer: "✚",
        DPS: "⚔"
    };

    container.innerHTML =
        recentRolls
        .map(
            function(roll) {

                const storedFullName =
                    [
                        roll.first_name,
                        roll.last_name
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();

                const displayName =
                    storedFullName ||
                    roll.character_name ||
                    "Unknown Adventurer";

                const safeName =
                    escapeHtml(
                        displayName
                    );

                const safeClass =
                    escapeHtml(
                        roll.class_name
                    );

                const safeRole =
                    ["Tank","Healer","DPS"].includes(
                        roll.role
                    )
                    ?
                    roll.role
                    :
                    "Unknown";

                const classColour =
                    classColours[
                        roll.class_name
                    ]
                    ||
                    "#d7a94b";

                const classIcon =
                    "https://wow.zamimg.com/images/wow/icons/large/classicon_"
                    +
                    encodeURIComponent(
                        String(roll.class_name).toLowerCase()
                    )
                    +
                    ".jpg";

                const roleIcon =
                    roleIcons[
                        safeRole
                    ]
                    ||
                    "?";

                return `
                <div class="roll-row">
                    <div class="roll-character" style="color:${classColour}" title="${safeName}">
                    ${safeName}
                    </div>

                    <div class="roll-role-icon wow-history-role" data-role="${safeRole}" title="${safeRole}">
                    ${roleIcon}
                    </div>

                    <div class="roll-class" style="color:${classColour}" title="${safeClass}">
                    <img class="roll-class-icon" src="${classIcon}" alt="">
                    <span>${safeClass}</span>
                    </div>

                    <div class="roll-body">
                    Body Type ${escapeHtml(String(roll.body_type))}
                    </div>
                    <span class="guild-rank" data-rank="${escapeHtml(roll.guild_rank || "Trial")}">${escapeHtml(roll.guild_rank || "Trial")}${roll.application_status === "Pending" ? " • Pending" : ""}</span>
                </div>
                `;
            }
        )
        .join("");
}


/* =========================================================
   DISTRIBUTION
========================================================= */

function updateClassDistribution() {

    const counts =
    {

        Warrior:
            0,

        Paladin:
            0,

        Hunter:
            0,

        Rogue:
            0,

        Priest:
            0,

        Shaman:
            0,

        Mage:
            0,

        Warlock:
            0,

        Druid:
            0

    };


    recentRolls.forEach(
        function(roll) {

            if (
                counts[
                    roll.class_name
                ]
                !==
                undefined
            ) {

                counts[
                    roll.class_name
                ]++;

            }

        }
    );


    Object.keys(
        counts
    )
    .forEach(
        function(className) {

            document
            .getElementById(
                "count" +
                className
            )
            .textContent =
                counts[
                    className
                ];

        }
    );


    document
    .getElementById(
        "recentRollCount"
    )
    .textContent =
        recentRolls.length;


    let leader =
        "—";


    let leaderCount =
        0;


    Object.entries(
        counts
    )
    .forEach(
        function(
            [
                className,
                count
            ]
        ) {

            if (
                count >
                leaderCount
            ) {

                leader =
                    className;


                leaderCount =
                    count;

            }

        }
    );


    document
    .getElementById(
        "mostRolledClass"
    )
    .textContent =
        leader;

}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}
