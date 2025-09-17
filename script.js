document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAZIONE E COSTANTI ---
    const SILO_ID = 'fef8244a-32a1-49b4-8554-115925117c9f';
    const API_KEY = 'dqbKXp5bWCc8D6hHAq23GhuBer2Gd2qFs813iBQYXT';
    const SILO_URL = `https://api.jsonsilo.com/${SILO_ID}`;
    const DECK = ['7', '8', '9', 'D', 'J', 'Q', 'K', 'A'];
    const CARD_VALUES = { '7': 7, '8': 8, '9': 9, 'D': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    const MAX_LEADERBOARD_ENTRIES = 3;
    const MAX_NAME_LENGTH = 15;
    const KEY_LAYOUT = ["QWERTYUIOP", "ASDFGHJKL", "SHIFT ZXCVBNM DEL", "  ENTER"];

    // --- OGGETTO DI CONFIGURAZIONE PER IL TUNING ---
    const config = {
        screen: { top: 5, left: 3, width: 67, height: 60 },
        keyboard: { top: 66, left: 4, width: 92, height: 29, opacity: 50 },
        zoom: 100
    };

    // --- ELEMENTI DOM ---
    const gameContainer = document.getElementById('game-container');
    const screenOverlay = document.getElementById('screen-overlay');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    const playerNameInput = document.getElementById('player-name');
    const actionButton = document.getElementById('action-button');
    const soundToggleButton = document.getElementById('sound-toggle-button');
    const sourceToggleButton = document.getElementById('source-toggle-button');
    const tuningToggle = document.getElementById('tuning-toggle-button');
    const tuningPanel = document.getElementById('tuning-panel');
    const cardElements = Array.from({ length: 5 }, (_, i) => document.getElementById(`card-${i}`));
    const messageBox = document.getElementById('message-box');
    const handInfo = document.getElementById('hand-info');
    const scoreInfo = document.getElementById('score-info');
    const nameInputSection = document.getElementById('name-input-section');
    const gameSection = document.getElementById('game-section');
    const leaderboardSection = document.getElementById('leaderboard-section');
    const leaderboardList = document.getElementById('leaderboard-list');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const codeDisplay = document.getElementById('code-display');
    const closeTerminalButton = document.getElementById('close-terminal-button');

    // --- STATO DEL GIOCO ---
    let playerName = '';
    let isShift = false;
    let audioCtx, isMuted = true;
    let currentHand = [], handNumber = 1, totalScore = 0, gamePhase = 'deal', drawCount = 0;
    let typingInterval = null, currentAction = null;
    
    // --- FUNZIONI DI INIZIALIZZAZIONE E UTILITY ---
    function applyStyles() {
        screenOverlay.style.top = `${config.screen.top}%`;
        screenOverlay.style.left = `${config.screen.left}%`;
        screenOverlay.style.width = `${config.screen.width}%`;
        screenOverlay.style.height = `${config.screen.height}%`;
        
        virtualKeyboard.style.top = `${config.keyboard.top}%`;
        virtualKeyboard.style.left = `${config.keyboard.left}%`;
        virtualKeyboard.style.width = `${config.keyboard.width}%`;
        virtualKeyboard.style.height = `${config.keyboard.height}%`;
        virtualKeyboard.style.opacity = config.keyboard.opacity / 100;
        
        gameContainer.style.transform = `scale(${config.zoom / 100})`;
    }

    function initTuningMode() {
        const closePanel = () => {
            tuningPanel.style.display = 'none';
            window.removeEventListener('click', closePanelOnClickOutside);
        };
        const closePanelOnClickOutside = (event) => { if (!tuningPanel.contains(event.target) && event.target !== tuningToggle) closePanel(); };
        
        tuningToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isVisible = tuningPanel.style.display === 'block';
            if (isVisible) {
                closePanel();
            } else {
                tuningPanel.style.display = 'block';
                setTimeout(() => window.addEventListener('click', closePanelOnClickOutside), 0);
            }
        });

        const controls = [
            { id: 'sTop', obj: 'screen', prop: 'top', min: 0, max: 100, label: 'Scr Top' },
            { id: 'sLeft', obj: 'screen', prop: 'left', min: 0, max: 100, label: 'Scr Left' },
            { id: 'sWidth', obj: 'screen', prop: 'width', min: 0, max: 100, label: 'Scr Width' },
            { id: 'sHeight', obj: 'screen', prop: 'height', min: 0, max: 100, label: 'Scr Height' },
            { id: 'kTop', obj: 'keyboard', prop: 'top', min: 0, max: 100, label: 'Keyb Top' },
            { id: 'kLeft', obj: 'keyboard', prop: 'left', min: 0, max: 100, label: 'Keyb Left' },
            { id: 'kWidth', obj: 'keyboard', prop: 'width', min: 0, max: 100, label: 'Keyb Width' },
            { id: 'kHeight', obj: 'keyboard', prop: 'height', min: 0, max: 100, label: 'Keyb Height' },
            { id: 'kOpacity', obj: 'keyboard', prop: 'opacity', min: 0, max: 100, label: 'Keyb Opacity' },
            { id: 'zoom', obj: null, prop: 'zoom', min: 50, max: 150, label: 'Zoom' }
        ];

        tuningPanel.innerHTML = `<div><strong>Pannello Calibrazione</strong></div>` +
            controls.map(c => `<div><label for="${c.id}">${c.label}:</label> <input type="range" id="${c.id}" min="${c.min}" max="${c.max}" value="${c.obj ? config[c.obj][c.prop] : config[c.prop]}"> <span id="${c.id}-val"></span></div>`).join('');
        
        controls.forEach(c => {
            const slider = document.getElementById(c.id);
            const valueSpan = document.getElementById(`${c.id}-val`);
            const updateValue = () => {
                const target = c.obj ? config[c.obj] : config;
                target[c.prop] = slider.value;
                valueSpan.textContent = `${slider.value}%`;
                applyStyles();
            };
            slider.addEventListener('input', updateValue);
            updateValue(); // Set initial text
        });
    }

    // --- MOTORE AUDIO, TASTIERA VIRTUALE, TERMINALE --- (invariati)
    
    // --- FUNZIONI DI GIOCO ---
    // ... (tutto il resto del codice è invariato)

    // --- INIZIALIZZAZIONE ---
    function init() {
        createVirtualKeyboard();
        applyStyles();
        initTuningMode();
        initTerminalMode();
        showNameScreen();
        // ... tutti gli event listener ...
    }
    
    init();
});
