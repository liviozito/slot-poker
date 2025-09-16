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

    // --- Variabili di stato del gioco ---
    const DECK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'D', 'J', 'Q', 'K'];
    let currentHand = [];
    let handNumber = 1;
    let totalScore = 0;
    let gamePhase = 'deal'; // 'deal' o 'result'

    // --- Logica di valutazione (tradotta dal tuo BASIC!) ---
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
    
    // --- Funzioni di gioco ---
    function dealHand() {
        gamePhase = 'deal';
        currentHand = Array(5).fill(null).map(() => DECK[Math.floor(Math.random() * DECK.length)]);
        cardElements.forEach(card => card.classList.remove('selected'));
        updateDisplay();
        messageBox.textContent = 'Seleziona le carte da cambiare e premi "Cambia"';
        changeButton.style.display = 'inline-block';
        nextHandButton.style.display = 'none';
    }

    function updateDisplay() {
        handInfo.textContent = `Mano: ${handNumber}/5`;
        scoreInfo.textContent = `Punteggio: ${totalScore}`;
        cardElements.forEach((el, i) => {
            el.textContent = currentHand[i];
        });
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

    // --- Inizio del gioco ---
    dealHand();
});