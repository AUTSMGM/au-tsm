/* =========================================================
   THE LICH KING — EXTREMELY UNHELPFUL SITE HELPER V3
========================================================= */
(function () {
    const helper = document.getElementById('lichHelper');
    const speech = document.getElementById('lichSpeech');
    const speechText = document.getElementById('lichSpeechText');
    const askButton = document.getElementById('lichAskButton');
    const closeButton = document.getElementById('lichHelperClose');
    const characterButton = document.getElementById('lichCharacterButton');

    if (!helper || !speech || !speechText || !askButton || !closeButton || !characterButton) return;

    const lines = [
        'Have you considered getting good?',
        'I bet you can’t even beat the raid test.',
        'Don’t stand in the fire... unless your name is Roks.',
        'Have you tried blaming the healer?',
        'Frostmourne hungers. Your parses do not.',
        'Your rotation appears to be mostly panic.',
        'Phinky has reviewed your request and recommends more DPS.',
        'The DPS meter remembers everything.',
        'I could help... but this is much funnier.',
        'Another wipe? Excellent. My work here is done.',
        'Perhaps your true BiS item was competence all along.',
        'Your raid spot is safe. Probably. I am not in charge.',
        'Stand in the fire. Acquire data.',
        'No king rules forever. Except apparently Phinky.',
        'You have my blessing to blame latency.',
        'If in doubt, press buttons harder.',
        'I foresee a glorious future... for someone else’s loot.',
        'The Lich King demands one thing: stop keyboard turning.',
        'This advice costs one flask and your dignity.'
    ];

    let hideTimer = null;
    let dismissed = false;
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
        if (dismissed) return;

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
        window.clearTimeout(hideTimer);
        helper.classList.remove('is-visible');

        window.setTimeout(() => {
            helper.hidden = true;
            window.dispatchEvent(new CustomEvent('autsm:lich-dismissed'));
        }, 1100);
    });

    /* Arrive smoothly three seconds after entry. */
    window.setTimeout(() => {
        if (dismissed) return;

        helper.hidden = false;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                helper.classList.add('is-visible');
            });
        });

        /* Let the character nearly finish rising before speaking. */
        window.setTimeout(() => {
            showSpeech('Mortal... is there anything I can help you with?', 6500);
        }, 850);

    }, 3000);
})();
