document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAZIONE E CALIBRAZIONE ---
    const screenConfig = { top: 5, left: 3, width: 67, height: 60, zoom: 100 };
    const screenOverlay = document.getElementById('screen-overlay');
    const gameContainer = document.getElementById('game-container');

    function applyStyles() {
        screenOverlay.style.top = `${screenConfig.top}%`;
        screenOverlay.style.left = `${screenConfig.left}%`;
        screenOverlay.style.width = `${screenConfig.width}%`;
        screenOverlay.style.height = `${screenConfig.height}%`;
        gameContainer.style.transform = `scale(${screenConfig.zoom / 100})`;
    }

    function initTuningMode() {
        const tuningToggle = document.getElementById('tuning-toggle-button');
        const panel = document.getElementById('tuning-panel');
        tuningToggle.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        });
        panel.innerHTML = `
            <div><strong>Pannello Calibrazione</strong></div>
            <div><label for="top">Top:</label> <input type="range" id="top" min="0" max="100" value="${screenConfig.top}"> <span id="top-val">${screenConfig.top}%</span></div>
            <div><label for="left">Left:</label> <input type="range" id="left" min="0" max="100" value="${screenConfig.left}"> <span id="left-val">${screenConfig.left}%</span></div>
            <div><label for="width">Width:</label> <input type="range" id="width" min="0" max="100" value="${screenConfig.width}"> <span id="width-val">${screenConfig.width}%</span></div>
            <div><label for="height">Height:</label> <input type="range" id="height" min="0" max="100" value="${screenConfig.height}"> <span id="height-val">${screenConfig.height}%</span></div>
            <div><label for="zoom">Zoom:</label> <input type="range" id="zoom" min="50" max="150" value="${screenConfig.zoom}"> <span id="zoom-val">${screenConfig.zoom}%</span></div>
        `;
        ['top', 'left', 'width', 'height', 'zoom'].forEach(prop => {
            const slider = document.getElementById(prop);
            const valueSpan = document.getElementById(`${prop}-val`);
            slider.addEventListener('input', () => {
                screenConfig[prop] = slider.value;
                valueSpan.textContent = `${slider.value}%`;
                applyStyles();
            });
        });
    }

    // --- GESTIONE SUONI (v2.7) ---
    const sounds = {
        click: new Audio('https://cdn.freesound.org/previews/253/253886_4486188-lq.mp3'),
        spin: new Audio('https://cdn.freesound.org/previews/399/399303_5121236-lq.mp3'),
        win: new Audio('https://cdn.freesound.org/previews/270/270319_5121236-lq.mp3')
    };
    
    let audioUnlocked = false;
    function unlockAudio() {
        if (audioUnlocked) return;
        Object.values(sounds).forEach(sound => {
            sound.volume = 0;
            sound.play().catch(() => {});
            sound.pause();
            sound.currentTime = 0;
            sound.volume = 0.5;
        });
        audioUnlocked = true;
    }

    function playSound(soundName) {
        if (!audioUnlocked || !sounds[soundName]) return;
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.error("Errore audio:", e));
    }

    // --- Elementi dell'interfaccia ---
    const cardElements = Array.from({ length: 5 }, (_, i) => document.getElementById(`card-${i}`));
    const messageBox = document.getElementById('message-box');
    const handInfo = document.getElementById('hand-info');
    const scoreInfo = document.getElementById('score-info');
    const nameInputSection = document.getElementById('name-input-section');
    const gameSection = document.getElementById('game-section');
    const leaderboardSection = document.getElementById('leaderboard-section');
    const playerNameInput = document.getElementById('player-name');
    const leaderboardList = document.getElementById('leaderboard-list');
    const actionButton = document.getElementById('action-button');
    const DECK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'D', 'J', 'Q', 'K'];
    let currentHand = [];
    let handNumber = 1;
    let totalScore = 0;
    let playerName = '';
    let gamePhase = 'deal';
    let drawCount = 0;
    const MAX_LEADERBOARD_ENTRIES = 3;

    function evaluateHand(hand) {
        const counts = {};
        hand.forEach(card => { counts[card] = (counts[card] || 0) + 1; });
        const vals = Object.values(counts).sort((a, b) => b - a);
        if (vals[0] === 5) return { name: "Slot Machine!", points: 500 };
        if (vals[0] === 4) return { name: "Poker", points: 400 };
        if (vals[0] === 3 && vals[1] === 2) return { name: "Full", points: 320 };
        if (vals[0] === 3) return { name: "Tris", points: 300 };
        if (vals[0] === 2 && vals[1] === 2) return { name: "Doppia Coppia", points: 200 };
        if (vals[0] === 2) return { name: "Coppia", points: 100 };
        return { name: "Carta Alta", points: 0 };
    }

    function updateDisplay() {
        handInfo.textContent = `Mano: ${handNumber}/5`;
        scoreInfo.textContent = `Punteggio: ${totalScore}`;
        cardElements.forEach((el, i) => {
            el.textContent = currentHand[i] || '';
        });
    }

    function showSection(sectionId) {
        ['name-input-section', 'game-section', 'leaderboard-section'].forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'flex';
    }

    function getLeaderboard() {
        return JSON.parse(localStorage.getItem('slotPokerLeaderboard') || '[]').sort((a, b) => b.score - a.score);
    }

    function saveScore(name, score) {
        const leaderboard = getLeaderboard();
        const now = new Date();
        const dateString = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        leaderboard.push({ name, score, date: dateString });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('slotPokerLeaderboard', JSON.stringify(leaderboard.slice(0, 10)));
    }

    function displayLeaderboard() {
        const leaderboard = getLeaderboard();
        leaderboardList.innerHTML = '';
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<li>Nessun punteggio ancora.</li>';
        } else {
            leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES).forEach((entry, index) => {
                const li = document.createElement('li');
                li.textContent = `${entry.name}: ${entry.score} p. (${entry.date})`;
                if (index === 0) li.classList.add('top-score');
                leaderboardList.appendChild(li);
            });
        }
        showSection('leaderboard-section');
        updateActionButton('Gioca Ancora', showNameScreen);
    }

    function showNameScreen() {
        const lastPlayerName = localStorage.getItem('slotPokerLastName');
        if (lastPlayerName) {
            playerNameInput.value = lastPlayerName;
        }
        showSection('name-input-section');
        updateActionButton('Inizia a Giocare', startGame);
    }

    let currentAction = null;
    function updateActionButton(text, action) {
        actionButton.textContent = text;
        if (currentAction) {
            actionButton.removeEventListener('click', currentAction);
        }
        currentAction = action;
        actionButton.addEventListener('click', currentAction);
        actionButton.style.display = 'inline-block';
    }

    function startGame() {
        unlockAudio(); // Sblocca i suoni al primo click per iniziare
        playerName = playerNameInput.value.trim();
        if (playerName === '') {
            alert('Per favore, inserisci il tuo nome per iniziare!');
            return;
        }
        localStorage.setItem('slotPokerLastName', playerName);
        handNumber = 1;
        totalScore = 0;
        showSection('game-section');
        dealHand();
    }

    function dealHand() {
        gamePhase = 'deal';
        drawCount = 0;
        currentHand = Array(5).fill(null).map(() => DECK[Math.floor(Math.random() * DECK.length)]);
        cardElements.forEach(card => card.classList.remove('selected'));
        updateDisplay();
        messageBox.textContent = `1° Cambio: Seleziona carte`;
        updateActionButton('Cambia', changeCards);
    }

    function animateAndChangeCards() {
        const cardsToChange = [];
        cardElements.forEach((card, index) => {
            if (card.classList.contains('selected')) {
                cardsToChange.push({ element: card, index: index });
            }
        });
        if (cardsToChange.length === 0) {
            drawCount++;
            if (drawCount < 3) {
                messageBox.textContent = `${drawCount + 1}° Cambio: Seleziona carte`;
            } else {
                showResult();
            }
            return;
        }
        playSound('spin');
        actionButton.disabled = true; // Disabilita il pulsante durante l'animazione
        let animationCounter = 0;
        const animationInterval = setInterval(() => {
            animationCounter++;
            cardsToChange.forEach(cardInfo => {
                cardInfo.element.textContent = DECK[Math.floor(Math.random() * DECK.length)];
            });
            if (animationCounter > 10) {
                clearInterval(animationInterval);
                cardsToChange.forEach(cardInfo => {
                    currentHand[cardInfo.index] = DECK[Math.floor(Math.random() * DECK.length)];
                });
                cardElements.forEach(card => card.classList.remove('selected'));
                updateDisplay();
                drawCount++;
                if (drawCount < 3) {
                    messageBox.textContent = `${drawCount + 1}° Cambio: Seleziona carte`;
                } else {
                    showResult();
                }
                actionButton.disabled = false; // Riabilita il pulsante
            }
        }, 50);
    }

    function changeCards() {
        if (gamePhase !== 'deal') return;
        animateAndChangeCards();
    }

    function showResult() {
        gamePhase = 'result';
        const result = evaluateHand(currentHand);
        if (result.points > 0) {
            playSound('win');
        }
        totalScore += result.points;
        updateDisplay();
        messageBox.textContent = `Risultato: ${result.name} (+${result.points} p.)`;
        if (handNumber < 5) {
            updateActionButton('Prossima Mano', () => {
                handNumber++;
                dealHand();
            });
        } else {
            actionButton.style.display = 'none';
            messageBox.textContent += ` | Partita Finita!`;
            saveScore(playerName, totalScore);
            setTimeout(displayLeaderboard, 2000);
        }
    }

    cardElements.forEach(card => card.addEventListener('click', () => {
        if (gamePhase === 'deal') {
            card.classList.toggle('selected');
            playSound('click');
        }
    }));

    playerNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            actionButton.click();
        }
    });

    function init() {
        applyStyles();
        initTuningMode();
        showNameScreen();
    }

    init();
});
