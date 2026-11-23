
const emojis = ['🍎', '🚗', '🐶', '🌟', '🎮', '🎵', '🐱', '⚽'];

let cards = [...emojis, ...emojis];
let firstCard = null;
let secondCard = null;
let lock = false;
let startTime = null;
let timerInterval = null;
let matchedPairs = 0;
let gameStarted = false;

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    startTime = Date.now();

    timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function saveBestTime(time) {
    const best = localStorage.getItem('bestTime');

    if (best === null || time < Number(best)) {
        localStorage.setItem('bestTime', time);
    }

    document.getElementById('bestTime').textContent =
        formatTime(Number(localStorage.getItem('bestTime')));
}

function setupGame() {
    stopTimer();

    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    cards = shuffle([...emojis, ...emojis]);

    firstCard = null;
    secondCard = null;
    lock = false;
    matchedPairs = 0;
    gameStarted = false;
    startTime = null;

    document.getElementById('timer').textContent = '00:00';

    const best = localStorage.getItem('bestTime');

    document.getElementById('bestTime').textContent =
        best === null ? '--:--' : formatTime(Number(best));

    cards.forEach((emoji) => {
        const card = document.createElement('div');

        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.textContent = '';

        card.addEventListener('click', () => flipCard(card));

        board.appendChild(card);
    });
}

function flipCard(card) {
    if (lock || card.classList.contains('flipped')) return;

    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    card.textContent = card.dataset.emoji;
    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lock = true;

    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        matchedPairs++;

        firstCard = null;
        secondCard = null;
        lock = false;

        if (matchedPairs === emojis.length) {
            stopTimer();

            const time = Math.floor((Date.now() - startTime) / 1000);

            saveBestTime(time);

            setTimeout(() => {
                alert('¡Felicidades! Terminaste el memorama.');
            }, 300);
        }
    } else {
        setTimeout(() => {
            firstCard.textContent = '';
            secondCard.textContent = '';

            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            firstCard = null;
            secondCard = null;
            lock = false;
        }, 1000);
    }
}

document.getElementById('restartBtn')
    .addEventListener('click', setupGame);

setupGame();

// Registro del Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.error('Error al registrar SW', err));
}

// Instalación manual de la PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const btn = document.getElementById('btnInstall');
    btn.style.display = 'block';
});

document.getElementById('btnInstall').addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;

    console.log('Resultado de instalación:', choiceResult.outcome);

    deferredPrompt = null;
    document.getElementById('btnInstall').style.display = 'none';
});
