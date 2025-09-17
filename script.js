document.addEventListener('DOMContentLoaded', () => {
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

    // --- Variabili di stato del gioco ---
    const DECK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'D', 'J', 'Q', 'K'];
    let currentHand = [];
    let handNumber = 1;
    let totalScore = 0;
    let playerName = '';
    let gamePhase = 'deal';
    const MAX_LEADERBOARD_ENTRIES = 3;

    // --- Logica di valutazione (invariata) ---
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

    // --- Funzioni di visualizzazione ---
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

    // --- Gestione Classifica e Nome Utente (LocalStorage) ---
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
        updateActionButton('Gioca Ancora', () => showSection('name-input-section'));
    }

    // --- Funzione di Controllo del Pulsante Unico ---
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
    
    // --- Funzioni di Gioco ---
    function startGame() {
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
        currentHand = Array(5).fill(null).map(() => DECK[Math.floor(Math.random() * DECK.length)]);
        cardElements.forEach(card => card.classList.remove('selected'));
        updateDisplay();
        messageBox.textContent = 'Seleziona le carte da cambiare';
        updateActionButton('Cambia', changeCards);
    }

    function changeCards() {
        if (gamePhase !== 'deal') return;
        cardElements.forEach((card, index) => {
            if (card.classList.contains('selected')) {
                currentHand[index] = DECK[Math.floor(Math.random() * DECK.length)];
            }
        });
        showResult();
    }

    function showResult() {
        gamePhase = 'result';
        const result = evaluateHand(currentHand);
        totalScore += result.points;
        updateDisplay();
        messageBox.textContent = `Risultato: ${result.name} (+${result.points} p.)`;
        
        if (handNumber < 5) {
            updateActionButton('Prossima Mano', () => {
                handNumber++;
                dealHand();
            });
        } else {
            actionButton.style.display = 'none'; // Nasconde il pulsante durante l'attesa
            messageBox.textContent += ` | Partita Finita!`;
            saveScore(playerName, totalScore);
            setTimeout(displayLeaderboard, 2000);
        }
    }

    // --- Gestione Eventi ---
    cardElements.forEach(card => card.addEventListener('click', () => {
        if (gamePhase === 'deal') card.classList.toggle('selected');
    }));

    playerNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            startGame();
        }
    });

    // --- Inizializzazione ---
    function init() {
        const lastPlayerName = localStorage.getItem('slotPokerLastName');
        if (lastPlayerName) {
            playerNameInput.value = lastPlayerName;
        }
        displayLeaderboard();
        updateActionButton('Inizia a Giocare', startGame);
        // La prima visualizzazione è la classifica, quindi mostriamo il pulsante "Gioca Ancora"
        // Ma siccome all'inizio non c'è una partita, "Gioca Ancora" porta alla schermata del nome
        updateActionButton('Inizia a Giocare', () => showSection('name-input-section'));
    }

    init();
});
