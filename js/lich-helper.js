/* =========================================================
   AU TSM - TOTALLY USELESS LICH KING HELPER
========================================================= */

(function () {
    const helper = document.getElementById('lichHelper');
    const model = document.getElementById('lichHelperModel');
    const bubble = document.getElementById('lichHelperBubble');
    const text = document.getElementById('lichHelperText');
    const ask = document.getElementById('lichHelperAsk');
    const close = document.getElementById('lichHelperClose');

    if (!helper || !model || !bubble || !text || !ask || !close) return;

    const quotes = [
        'Have you considered getting good?',
        'I bet you can\'t even beat the raid test.',
        'Don\'t stand in the fire... unless your name is Roks.',
        'Your gear is temporary. My disappointment is eternal.',
        'Frostmourne hungers. Your parses do not.',
        'A wipe is just a raid strategy with extra steps.',
        'Have you tried blaming the healer?',
        'The DPS meter remembers everything.',
        'You may enter Icecrown when your logs improve.',
        'Your rotation appears to be mostly panic.',
        'Phinky has reserved your loot. Naturally.',
        'I sense fear... and several unbound keybinds.',
        'Stand in the fire if you seek a swift promotion to spectator.',
        'The raid leader said spread. You heard stack.',
        'Your cooldowns cannot help you if you never press them.',
        'I have conquered kingdoms with fewer spreadsheets than this guild.',
        'You are not prepared... which is apparently normal here.',
        'Perhaps another character will fix your mechanical issues.',
        'The Frozen Throne has reviewed your application. Grim news.',
        'I could help, but watching this is much funnier.'
    ];

    let bubbleTimer = null;
    let lastQuote = -1;
    let dismissed = false;

    function showBubble(message, duration = 5200) {
        if (dismissed) return;

        window.clearTimeout(bubbleTimer);
        text.textContent = message;
        bubble.classList.add('is-speaking');

        bubbleTimer = window.setTimeout(function () {
            bubble.classList.remove('is-speaking');
        }, duration);
    }

    function randomQuote() {
        if (!quotes.length) return;

        let index = Math.floor(Math.random() * quotes.length);
        if (quotes.length > 1 && index === lastQuote) {
            index = (index + 1 + Math.floor(Math.random() * (quotes.length - 1))) % quotes.length;
        }

        lastQuote = index;
        showBubble(quotes[index], 5000);
    }

    function appear() {
        if (dismissed) return;
        helper.classList.add('is-visible');

        window.setTimeout(function () {
            showBubble('Mortal... is there anything I can help you with?', 6200);
        }, 650);
    }

    ask.addEventListener('click', function (event) {
        event.stopPropagation();
        randomQuote();
    });

    model.addEventListener('click', randomQuote);

    close.addEventListener('click', function (event) {
        event.stopPropagation();
        dismissed = true;
        window.clearTimeout(bubbleTimer);
        bubble.classList.remove('is-speaking');
        helper.classList.add('is-dismissed');
        helper.classList.remove('is-visible');
    });

    /* Let the rest of the homepage settle before he rises from the corner. */
    window.setTimeout(appear, 3000);
})();
