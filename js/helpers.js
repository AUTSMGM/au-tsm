/* =========================================================
   HELPERS
========================================================= */

function randomItem(array) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}


function randomNumber(
    minimum,
    maximum
) {

    return Math.floor(
        Math.random() *
        (
            maximum -
            minimum +
            1
        )
    )
    +
    minimum;

}


/* =========================================================
   TOAST
========================================================= */

const toast =
    document.getElementById(
        "toast"
    );


let toastTimeout =
    null;


function showToast(text) {

    toast.textContent =
        text;


    toast.style.display =
        "block";


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(function() {

            toast.style.display =
                "none";

        },5000);

}


/* =========================================================
   AUDIO
========================================================= */

const backgroundMusic =
    document.getElementById(
        "backgroundMusic"
    );

const readyCheckSound =
    document.getElementById(
        "readyCheckSound"
    );

const verySlowlySound =
    document.getElementById(
        "verySlowlySound"
    );

const wtfSound =
    document.getElementById(
        "wtfSound"
    );

const moreDotsSound =
    document.getElementById(
        "moreDotsSound"
    );

const gratzSound =
    document.getElementById(
        "gratzSound"
    );

const levelUpSound =
    document.getElementById(
        "levelUpSound"
    );

const musicButton =
    document.getElementById(
        "musicButton"
    );


const NORMAL_MUSIC_VOLUME =
    .18;

const DUCKED_MUSIC_VOLUME =
    .04;

const SOUND_GAP =
    300;


backgroundMusic.volume =
    NORMAL_MUSIC_VOLUME;


let musicPlaying =
    false;


const soundQueue =
    [];


let foregroundSoundPlaying =
    false;


function queueSound(
    audio,
    expireAfter = null
) {

    if (!audio) {
        return;
    }


    soundQueue.push({

        audio:
            audio,

        queuedAt:
            performance.now(),

        expireAfter:
            expireAfter

    });


    processSoundQueue();

}


async function processSoundQueue() {

    if (
        foregroundSoundPlaying
    ) {

        return;

    }


    while (
        soundQueue.length >
        0
    ) {

        const item =
            soundQueue.shift();


        if (
            item.expireAfter !==
            null
        ) {

            if (
                performance.now()
                -
                item.queuedAt
                >
                item.expireAfter
            ) {

                continue;

            }

        }


        foregroundSoundPlaying =
            true;


        if (
            musicPlaying
        ) {

            backgroundMusic.volume =
                DUCKED_MUSIC_VOLUME;

        }


        const audio =
            item.audio;


        audio.pause();

        audio.currentTime =
            0;


        try {

            await audio.play();

        }

        catch(error) {

            foregroundSoundPlaying =
                false;


            setTimeout(
                processSoundQueue,
                SOUND_GAP
            );


            return;

        }


        audio.onended =
            function() {

                foregroundSoundPlaying =
                    false;


                setTimeout(
                    processSoundQueue,
                    SOUND_GAP
                );

            };


        return;

    }


    if (
        musicPlaying
    ) {

        backgroundMusic.volume =
            NORMAL_MUSIC_VOLUME;

    }

}


musicButton.onclick =
    async function() {

        if (
            !musicPlaying
        ) {

            try {

                await backgroundMusic.play();


                musicPlaying =
                    true;


                musicButton.textContent =
                    "♫ MUSIC: ON";


                musicButton.classList.add(
                    "music-on"
                );

            }

            catch(error) {

                showToast(
                    "Browser blocked audio. Click again."
                );

            }

        }

        else {

            backgroundMusic.pause();


            musicPlaying =
                false;


            musicButton.textContent =
                "♫ MUSIC: OFF";


            musicButton.classList.remove(
                "music-on"
            );

        }

    };
