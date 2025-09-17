document.addEventListener('DOMContentLoaded', () => {
    // --- COSTANTI E CONFIGURAZIONE ---
    const SILO_ID = 'fef8244a-32a1-49b4-8554-115925117c9f';
    const API_KEY = 'dqbKXp5bWCc8D6hHAq23GhuBer2Gd2qFs813iBQYXT';
    const SILO_URL = `https://api.jsonsilo.com/${SILO_ID}`;
    const DECK = ['7', '8', '9', 'D', 'J', 'Q', 'K', 'A'];
    const CARD_VALUES = { '7': 7, '8': 8, '9': 9, 'D': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    const MAX_LEADERBOARD_ENTRIES = 3;
    const MAX_NAME_LENGTH = 15;
    const KEY_LAYOUT = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
        [' ', 'ENTER']
    ];
    const config = {
        screen: { top: 5, left: 3, width: 67, height: 60 },
        keyboard: { top: 66, left: 4, width: 92, height: 29, opacity: 50 },
        zoom: 100
    };
    const original_basic_code = `1 CLS...`; // Il codice BASIC completo va qui
    
    // --- SELEZIONE ELEMENTI DOM ---
    const elements = {};
    const ids = ['game-container', 'screen-overlay', 'virtual-keyboard', 'player-name', 'action-button', 'sound-toggle-button', 'source-toggle-button', 'tuning-toggle-button', 'tuning-panel', 'message-box', 'hand-info', 'score-info', 'name-input-section', 'game-section', 'leaderboard-section', 'leaderboard-list', 'terminal-overlay', 'code-display', 'close-terminal-button', 'casio-body'];
    ids.forEach(id => elements[id] = document.getElementById(id));
    elements.cardElements = Array.from({ length: 5 }, (_, i) => document.getElementById(`card-${i}`));

    // --- VARIABILI DI STATO ---
    let playerName = '', isShift = false, audioCtx, isMuted = true;
    let currentHand = [], handNumber = 1, totalScore = 0, gamePhase = 'deal', drawCount = 0;
    let typingInterval = null, currentAction = null;

    // --- MOTORE AUDIO ---
    function initAudio() { /* ... codice ... */ }
    function playSound(type) { /* ... codice ... */ }

    // --- LOGICA DI GIOCO ---
    function evaluateHand(hand) { /* ... codice ... */ }
    // ... tutte le altre funzioni di gioco, classifica, etc. ...

    // --- TASTIERA VIRTUALE ---
    function createVirtualKeyboard() {
        elements.virtualKeyboard.innerHTML = '';
        KEY_LAYOUT.forEach(rowArray => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            rowArray.forEach(keySymbol => {
                const keyDiv = document.createElement('div');
                keyDiv.className = 'key';
                keyDiv.dataset.key = keySymbol;
                keyDiv.textContent = keySymbol;
                rowDiv.appendChild(keyDiv);
            });
            elements.virtualKeyboard.appendChild(rowDiv);
        });
    }

    // --- FUNZIONI DI INIZIALIZZAZIONE ---
    function applyStyles() { /* ... codice ... */ }
    function initTuningMode() {
        // CORREZIONE: Aggiunto l'ID allo span
        elements.tuningPanel.innerHTML = `<div><strong>Pannello Calibrazione</strong></div>` +
            Object.entries(config).flatMap(([key, value]) => {
                if (typeof value === 'object') {
                    return Object.keys(value).map(prop => ({ id: `${key.charAt(0)}${prop}`, obj: key, prop: prop, label: `${key.slice(0,4)} ${prop}` }));
                }
                return { id: key, obj: null, prop: key, label: key };
            }).map(c => `<div><label for="${c.id}">${c.label}:</label> <input type="range" id="${c.id}" min="0" max="150" value="${c.obj ? config[c.obj][c.prop] : config[c.prop]}"> <span id="${c.id}-val"></span></div>`).join('');

        // Il resto della funzione per attivare gli slider
        // ...
    }
    function initTerminalMode() { /* ... codice ... */ }

    function init() {
        // Sequenza di avvio corretta
        applyStyles();
        createVirtualKeyboard();
        initTuningMode();
        initTerminalMode();
        showNameScreen();
        // Attivazione di tutti gli event listener
        // ...
    }

    init();
});
