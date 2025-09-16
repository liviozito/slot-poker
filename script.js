document.addEventListener('DOMContentLoaded', () => {
    // --- Elementi dell'interfaccia ---
    const cardElements = [
        document.getElementById('card-0'),
        document.getElementById('card-1'),
        document.getElementById('card-2'),
        document.getElementById('card-3'),
        document.getElementById('card-4')
    ];
    const messageBox = document.getElementById('message-box');
    const changeButton = document.getElementById('change-button');
    const nextHandButton = document.getElementById('next-hand-button');
    const handInfo = document.getElementById('hand-info');
    const scoreInfo = document.getElementById('score-info');

    // Nuovi elementi per input nome e classifica
    const nameInputSection = document.getElementById('name-input-section');
    const gameSection = document.getElementById('game-section');
    const leaderboardSection = document.getElementById('leaderboard-section');
    const playerNameInput = document.getElementById('player-name');
    const startGameButton = document.getElementById('start-game-button');
    const leaderboardList = document.getElementById('leaderboard-list');
    const playAgainButton = document.getElementById('play-again-button');

    // --- Variabili di stato del gioco ---
    const DECK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'D', 'J', 'Q', 'K'];
    let currentHand = [];
    let handNumber = 1;
    let totalScore = 0;
    let playerName = '';
    let gamePhase = 'deal'; // 'deal' o 'result'

    const MAX_LEADERBOARD_ENTRIES = 3; // Quanti punteggi massimi visualizzare

    // --- Logica di valutazione (dal tuo BASIC!) ---
    function evaluateHand(hand) {
        const counts = {};
        hand.forEach(card => { counts[card] = (counts[card] || 0) + 1; });
        const vals = Object.values(counts).sort((a, b) => b - a);

        // La logica originale del BASIC era per 5 carte uguali (Slot Machine)
        // Per il poker moderno, la "scala" e "colore" sono basate su valori e semi
        // Per semplicità e fedeltà all'originale, manteniamo l'interpretazione del BASIC (combinazioni di carte uguali)

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
            el.textContent = currentHand[i] || ''; // Mostra vuoto se la mano non è ancora distribuita
        });
    }

    function showSection(sectionId) {
        nameInputSection.style.display = 'none';
        gameSection.style.display = 'none';
        leaderboardSection.style.display = 'none';

        document.getElementById(sectionId).style.display = 'block';
    }

    // --- Gestione Classifica (LocalStorage) ---
    function getLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('slotPokerLeaderboard') || '[]');
        return leaderboard.sort((a, b) => b.score - a.score); // Ordina dal più alto al più basso
    }

    function saveScore(name, score) {
        const leaderboard = getLeaderboard();
        leaderboard.push({ name, score, date: new Date().toLocaleString() });
        // Rimuovi i punteggi più bassi se superiamo il limite
        while (leaderboard.length > MAX_LEADERBOARD_ENTRIES * 2) { // Tieni un po' di più per rotazione
             leaderboard.sort((a, b) => b.score - a.score);
             leaderboard.pop();
        }
        localStorage.setItem('slotPokerLeaderboard', JSON.stringify(leaderboard));
    }

    function displayLeaderboard() {
        const leaderboard = getLeaderboard();
        leaderboardList.innerHTML = ''; // Pulisci la lista

        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<li>Nessun punteggio ancora.</li>';
        } else {
            leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES).forEach((entry, index) => {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${entry.name}: ${entry.score} punti (${entry.date})`;
                if (index === 0) { // Highlight del primo in classifica
                    li.classList.add('top-score');
                }
                leaderboardList.appendChild(li);
            });
        }
        showSection('leaderboard-section');
        playAgainButton.style.display = 'inline-block';
    }

    // --- Funzioni di gioco ---
    function startGame() {
        playerName = playerNameInput.value.trim();
        if (playerName === '') {
            messageBox.textContent = 'Per favore, inserisci il tuo nome per iniziare!';
            return;
        }
        
        // Inizializza i valori per una nuova partita
        handNumber = 1;
        totalScore = 0;
        updateDisplay();
        dealHand();
        showSection('game-section');
    }

    function dealHand() {
        gamePhase = 'deal';
        currentHand = Array(5).fill(null).map(() => DECK[Math.floor(Math.random() * DECK.length)]);
        cardElements.forEach(card => card.classList.remove('selected'));
        updateDisplay();
        messageBox.textContent = 'Seleziona le carte da cambiare e premi "Cambia"';
        changeButton.style.display = 'inline-block';
        nextHandButton.style.display = 'none';
        
        // Assicurati che il pulsante Gioca Ancora sia nascosto durante il gioco
        playAgainButton.style.display = 'none'; 
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
        updateDisplay();
        
        const result = evaluateHand(currentHand);
        totalScore += result.points;
        scoreInfo.textContent = `Punteggio: ${totalScore}`;
        
        messageBox.textContent = `Risultato: ${result.name} (+${result.points} punti)`;
        
        changeButton.style.display = 'none';
        if (handNumber < 5) {
            nextHandButton.style.display = 'inline-block';
        } else {
            messageBox.textContent += ` | GIOCO FINITO! Punteggio finale: ${totalScore}`;
            saveScore(playerName, totalScore); // Salva il punteggio
            setTimeout(displayLeaderboard, 3000); // Mostra classifica dopo 3 secondi
        }
    }

    // --- Gestione Eventi ---
    cardElements.forEach(card => {
        card.addEventListener('click', () => {
            if (gamePhase === 'deal') {
                card.classList.toggle('selected');
            }
        });
    });

    changeButton.addEventListener('click', changeCards);

    nextHandButton.addEventListener('click', () => {
        handNumber++;
        dealHand();
    });

    startGameButton.addEventListener('click', startGame);

    playAgainButton.addEventListener('click', () => {
        showSection('name-input-section'); // Torna all'input del nome per nuova partita
        playerNameInput.value = ''; // Pulisci il nome
    });

    // --- Inizializzazione: mostra la classifica all'avvio ---
    displayLeaderboard();
});
