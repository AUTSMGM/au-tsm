/* =========================================================
   RAGNAROS — EVEN LESS HELPFUL SITE HELPER
========================================================= */
(function () {
    const helper = document.getElementById('ragnarosHelper');
    const speech = document.getElementById('ragnarosSpeech');
    const speechText = document.getElementById('ragnarosSpeechText');
    const askButton = document.getElementById('ragnarosAskButton');
    const closeButton = document.getElementById('ragnarosClose');
    const characterButton = document.getElementById('ragnarosCharacterButton');

    if (!helper || !speech || !speechText || !askButton || !closeButton || !characterButton) return;

    const lines = [
        'BY FIRE BE PURGED!... looks like Roks already was.',
        'DIE, INSECTS!... oh. Roks is dead again.',
        'TOO SOON! ...except for Roks. He pulled anyway.',
        'TASTE THE FLAMES OF SULFURON!... Roks already did.',
        'YOU CANNOT ESCAPE THE LIVING FLAME!... especially not Roks.',
        'BURN! BURN IN THE MAKER’S FIRE!... Roks, stop volunteering.',
        'MY FLAMES SHALL CONSUME YOU!... Roks appears pre-consumed.',
        'KNEEL BEFORE THE FIRELORD!... Roks is already horizontal.',
        'MORTALS! YOU DARE CHALLENGE ME?... Roks apparently did not.',
        'THE FIRELORD HAS AWAKENED!... someone wake Roks too.',
        'FEEL THE HEAT OF THE CORE!... Roks felt it first.',
        'THE FLAMES COME FOR YOU!... they seem to have a tracking preference for Roks.',
        'SULFURON DEMANDS SACRIFICE!... Roks has contributed enough.',
        'THE FLOOR IS LAVA!... Roks thought that was an instruction.',
        'BEHOLD THE MIGHT OF RAGNAROS!... and the repair bill of Roks.',
        'YOU SHALL BURN!... unless your name is Phinky. Then apparently someone else gets blamed.',
        'FIRE RESISTANCE IS RECOMMENDED. Roks has instead chosen optimism.',
        'ANOTHER PULL! ANOTHER CORPSE! ...Roks, please stop speedrunning this part.',
        'THE CORE TREMBLES!... mostly from Roks running back from the graveyard.',
        'I HAVE SEEN MANY HEROES FALL. Roks is maintaining the average.'
    ];

    let hideTimer = null;
    let dismissed = false;
    let active = false;
    let lastLine = '';

    function pickLine() {
        let line = lines[Math.floor(Math.random() * lines.length)];
        if (lines.length > 1 && line === lastLine) {
            line = lines[(lines.indexOf(line) + 1) % lines.length];
        }
        lastLine = line;
        return line;
    }

    function showSpeech(text, duration = 5000) {
        if (dismissed || !active) return;

        window.clearTimeout(hideTimer);
        speechText.textContent = text;
        speech.classList.remove('is-hidden');

        hideTimer = window.setTimeout(() => {
            speech.classList.add('is-hidden');
        }, duration);
    }

    function askForHelp(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        showSpeech(pickLine(), 4800);
    }

    askButton.addEventListener('click', askForHelp);
    characterButton.addEventListener('click', askForHelp);

    closeButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        dismissed = true;
        active = false;
        window.clearTimeout(hideTimer);

        helper.classList.remove('is-visible');

        window.setTimeout(() => {
            helper.hidden = true;
        }, 1100);
    });

    window.addEventListener('autsm:lich-dismissed', function () {
        if (dismissed || active) return;

        active = true;

        /* Small beat after Arthas leaves, then Ragnaros charges in. */
        window.setTimeout(() => {
            helper.hidden = false;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    helper.classList.add('is-visible');
                });
            });

            window.setTimeout(() => {
                showSpeech('TOO SOON!... although apparently not for Roks.', 6500);
            }, 850);

        }, 650);
    });
})();
