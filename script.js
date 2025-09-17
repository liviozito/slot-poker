document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAZIONE DATABASE PUNTEGGI ---
    const SILO_ID = 'slot-poker';
    const API_KEY = 'dqbKXp5bWCc8D6hHAq23GhuBer2Gd2qFs813iBQYXT';
    const SILO_URL = `https://www.jsonsilo.com/silo/${SILO_ID}`;

    // --- MOTORE AUDIO SINTETIZZATO ---
    const soundToggleButton = document.getElementById('sound-toggle-button');
    let audioCtx;
    let isMuted = true;

    function initAudio() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API non è supportata da questo browser.");
            }
        }
    }

    soundToggleButton.addEventListener('click', () => {
        isMuted = !isMuted;
        soundToggleButton.textContent = isMuted ? '🔇' : '🔊';
        if (!isMuted && !audioCtx) {
            initAudio();
        }
        if(!isMuted) playSound('click');
    });

    function playSound(type) {
        if (isMuted || !audioCtx) return;
        const now = audioCtx.currentTime;
        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.2, now);

        if (type === 'click') {
            const oscillator = audioCtx.createOscillator();
            oscillator.connect(gainNode);
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(880, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        } else if (type === 'win') {
            const oscillator = audioCtx.createOscillator();
            oscillator.connect(gainNode);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, now);
            oscillator.frequency.setValueAtTime(659.25, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
        } else if (type === 'spin') {
            // --- NUOVO SUONO SLOT MACHINE (v3.3) ---
            let tickTime = 0;
            for (let i = 0; i < 5; i++) {
                const osc = audioCtx.createOscillator();
                osc.connect(gainNode);
                osc.type = 'square';
                osc.frequency.setValueAtTime(1500, now + tickTime);
                gainNode.gain.setValueAtTime(0.2, now + tickTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tickTime + 0.05);
                osc.start(now + tickTime);
                osc.stop(now + tickTime + 0.05);
                tickTime += 0.04;
            }
        }
    }
    
    // --- IL RESTO DEL GIOCO (invariato)---
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
    const DECK = ['7', '8', '9', 'D', 'J', 'Q', 'K', 'A'];
    const CARD_VALUES = { '7': 7, '8': 8, '9': 9, 'D': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
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
        const groups = Object.entries(counts).map(([card, count]) => ({
            card: card,
            cardValue: CARD_VALUES[card],
            count: count
        })).sort((a, b) => {
            if (a.count !== b.count) return b.count - a.count;
            return b.cardValue - a.cardValue;
        });
        const mainGroup = groups[0];
        if (mainGroup.count === 4) return { name: "Poker", points: 400 + mainGroup.cardValue * 4 };
        if (mainGroup.count === 3 && groups.length > 1 && groups[1].count === 2) return { name: "Full", points: 320 + mainGroup.cardValue * 3 + groups[1].cardValue * 2 };
        if (mainGroup.count === 3) return { name: "Tris", points: 300 + mainGroup.cardValue * 3 };
        if (mainGroup.count === 2 && groups.length > 1 && groups[1].count === 2) return { name: "Doppia Coppia", points: 200 + mainGroup.cardValue * 2 + groups[1].cardValue * 2 };
        if (mainGroup.count === 2) return { name: "Coppia", points: 100 + mainGroup.cardValue * 2 };
        return { name: "Carta Alta", points: Math.max(...hand.map(c => CARD_VALUES[c])) };
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

    async function getLeaderboard() {
        try {
            const response = await fetch(SILO_URL);
            if (!response.ok) return [];
            const data = await response.json();
            return data.leaderboard || [];
        } catch (e) {
            console.error("Errore nel caricare la classifica:", e);
            return [];
        }
    }

    async function saveScore(name, score) {
        let leaderboard = await getLeaderboard();
        const now = new Date();
        const dateString = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        leaderboard.push({ name, score, date: dateString });
        leaderboard.sort((a, b) => b.score - a.score);
        try {
            await fetch(SILO_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': API_KEY
                },
                body: JSON.stringify({ leaderboard: leaderboard.slice(0, 10) })
            });
        } catch (e) {
            console.error("Errore nel salvare la classifica:", e);
        }
    }
    
    async function displayLeaderboard() {
        leaderboardList.innerHTML = '<li>Caricamento...</li>';
        const leaderboard = await getLeaderboard();
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
        if (!audioCtx && !isMuted) initAudio();
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
        actionButton.disabled = true;
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
                actionButton.disabled = false;
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
        if (result.points > 100) {
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
            saveScore(playerName, totalScore).then(() => {
                setTimeout(displayLeaderboard, 2000);
            });
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
        showNameScreen();
    }

    init();
});
