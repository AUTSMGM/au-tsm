/* =========================================================
   WHEEL DATA
========================================================= */

const wheelClasses =
[

    {
        name:
            "Warrior",

        colour:
            "#C79C6E"
    },

    {
        name:
            "Paladin",

        colour:
            "#F58CBA"
    },

    {
        name:
            "Hunter",

        colour:
            "#ABD473"
    },

    {
        name:
            "Rogue",

        colour:
            "#FFF569"
    },

    {
        name:
            "Priest",

        colour:
            "#FFFFFF"
    },

    {
        name:
            "Shaman",

        colour:
            "#0070DE"
    },

    {
        name:
            "Mage",

        colour:
            "#69CCF0"
    },

    {
        name:
            "Warlock",

        colour:
            "#9482C9"
    },

    {
        name:
            "Druid",

        colour:
            "#FF7D0A"
    }

];


const bodyTypes =
[

    {
        id:
            1,

        name:
            "Body Type 1",

        colour:
            "#287ac2"
    },

    {
        id:
            2,

        name:
            "Body Type 2",

        colour:
            "#cf5d94"
    }

];


/* =========================================================
   CLASS ROLE VALIDATION
========================================================= */

const classRoles =
{
    Warrior: ["Tank","DPS"],
    Paladin: ["Tank","Healer","DPS"],
    Hunter: ["DPS"],
    Rogue: ["DPS"],
    Priest: ["Healer","DPS"],
    Shaman: ["Healer","DPS"],
    Mage: ["DPS"],
    Warlock: ["DPS"],
    Druid: ["Tank","Healer","DPS"]
};



// Combat identity is class-driven; role changes only damage, health and healing.
const classAttacks = {
 Warrior:{name:'Heroic Strike',symbol:'⚔',colour:'#c79c6e'},
 Paladin:{name:'Holy Strike',symbol:'✦',colour:'#ffe180'},
 Hunter:{name:'Bow & Arrow',symbol:'➶',colour:'#abd473'},
 Rogue:{name:'Throwing Knife',symbol:'🗡',colour:'#fff569'},
 Priest:{name:'Smite',symbol:'✧',colour:'#fff4c4'},
 Shaman:{name:'Lightning Bolt',symbol:'ϟ',colour:'#69ccff'},
 Mage:{name:'Fireball',symbol:'🔥',colour:'#ff873b'},
 Warlock:{name:'Shadow Bolt',symbol:'●',colour:'#9482c9'},
 Druid:{name:'Wrath',symbol:'☄',colour:'#8fe75d'}
};
function combatProfile(character) {
 const role=character.role;
 return {...classAttacks[character.class_name],maxHealth:role==='Tank'?10:5,damageMultiplier:role==='DPS'?1:0.75,healInterval:role==='Healer'?6:0};
}
