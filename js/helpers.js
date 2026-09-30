/* =========================================================
   HELPERS
========================================================= */

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

/* =========================================================
   TOAST
========================================================= */

const toast = document.getElementById("toast");
let toastTimeout = null;

function showToast(text) {
    if (!toast) {
        console.info(text);
        return;
    }

    toast.textContent = text;
    toast.style.display = "block";
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function() {
        toast.style.display = "none";
    }, 5000);
}

/* =========================================================
   AUDIO
========================================================= */

const backgroundMusic = document.getElementById("backgroundMusic");
const readyCheckSound = document.getElementById("readyCheckSound");
const verySlowlySound = document.getElementById("verySlowlySound");
const wtfSound = document.getElementById("wtfSound");
const moreDotsSound = document.getElementById("moreDotsSound");
const gratzSound = document.getElementById("gratzSound");
const levelUpSound = document.getElementById("levelUpSound");
const musicButton = document.getElementById("musicButton");

const NORMAL_MUSIC_VOLUME = .18;
const DUCKED_MUSIC_VOLUME = .04;
const SOUND_GAP = 300;
const MUSIC_STORAGE_KEY = "autsmMusicEnabled";

if (backgroundMusic) {
    backgroundMusic.volume = NORMAL_MUSIC_VOLUME;
}

let musicPlaying = false;
const soundQueue = [];
let foregroundSoundPlaying = false;

function updateMusicButton() {
    if (!musicButton) return;
    musicButton.textContent = musicPlaying ? "♫ MUSIC: ON" : "♫ MUSIC: OFF";
    musicButton.classList.toggle("music-on", musicPlaying);
}

function queueSound(audio, expireAfter = null) {
    if (!audio) return;
    soundQueue.push({ audio, queuedAt: performance.now(), expireAfter });
    processSoundQueue();
}

async function processSoundQueue() {
    if (foregroundSoundPlaying) return;

    while (soundQueue.length > 0) {
        const item = soundQueue.shift();
        if (item.expireAfter !== null && performance.now() - item.queuedAt > item.expireAfter) {
            continue;
        }

        foregroundSoundPlaying = true;
        if (musicPlaying && backgroundMusic) backgroundMusic.volume = DUCKED_MUSIC_VOLUME;

        const audio = item.audio;
        audio.pause();
        audio.currentTime = 0;

        try {
            await audio.play();
        } catch (error) {
            foregroundSoundPlaying = false;
            setTimeout(processSoundQueue, SOUND_GAP);
            return;
        }

        audio.onended = function() {
            foregroundSoundPlaying = false;
            setTimeout(processSoundQueue, SOUND_GAP);
        };
        return;
    }

    if (musicPlaying && backgroundMusic) backgroundMusic.volume = NORMAL_MUSIC_VOLUME;
}

async function setMusicEnabled(enabled, remember = true) {
    if (!backgroundMusic || !musicButton) return;

    if (enabled) {
        try {
            await backgroundMusic.play();
            musicPlaying = true;
            if (remember) localStorage.setItem(MUSIC_STORAGE_KEY, "1");
        } catch (error) {
            musicPlaying = false;
            if (remember) localStorage.setItem(MUSIC_STORAGE_KEY, "0");
            showToast("Browser blocked audio. Click MUSIC again.");
        }
    } else {
        backgroundMusic.pause();
        musicPlaying = false;
        if (remember) localStorage.setItem(MUSIC_STORAGE_KEY, "0");
    }

    updateMusicButton();
}

if (musicButton && backgroundMusic) {
    musicButton.addEventListener("click", async function() {
        await setMusicEnabled(!musicPlaying, true);
    });

    /* Keep the preference when moving between Home and Guild Tools.
       Browsers may still block autoplay on a new page; in that case the
       button remains OFF until the user clicks it again. */
    if (localStorage.getItem(MUSIC_STORAGE_KEY) === "1") {
        setMusicEnabled(true, false);
    } else {
        updateMusicButton();
    }
}
