document.addEventListener('DOMContentLoaded', () => {

    // --- CODICE SORGENTE ORIGINALE DEL 1988 (v7.0 - Completo e Corretto) ---
    const original_basic_code = `1 CLS
4 PRINT "Slot-Poker"
5 CLEAR:A$="A23456789DJQK":P=0:Y=0:INPUT 'N. gioc. (max 4)';N:IF N>4 THEN 5
6 CLS:DIM R(N):S=0
10 CLS:Y=Y+1:LOCATE 0,1:PRINT Y;"°":LOCATE 0,3:PRINT P
11 DIM A$(4):DIM I(4):FOR T=0 TO 4:X=INT(RND*6)+1:A$(T)=MID$(A$,X*2-1,2):I(T)=X
15 LOCATE T*3+3,1:PRINT A$(T):NEXT T:B=0:C=0:D=0:E=0:F=0:L$=""
20 K$=INKEY$:IF K$="" THEN 20
21 IF ASC(K$)=13 THEN LOCATE 0,3:PRINT " Wait!":GOTO 30
22 IF ASC(K$)>48 AND ASC(K$)<54 THEN 24 ELSE GOTO 20
24 LOCATE (VAL(K$))*3,1:PRINT CHR$(135);
25 IF K$=L$ THEN 20 ELSE L$=L$+K$:GOTO 20
30 FOR T=1 TO LEN(L$):D$=MID$(L$,T,1)
35 IF D$="1" THEN IF B=0 THEN B=1:K=0:GOSUB 1000
40 IF D$="2" THEN IF C=0 THEN C=1:K=1:GOSUB 1000
50 IF D$="3" THEN IF D=0 THEN D=1:K=2:GOSUB 1000
60 IF D$="4" THEN IF E=0 THEN E=1:K=3:GOSUB 1000
70 IF D$="5" THEN IF F=0 THEN F=1:K=4:GOSUB 1000
80 NEXT T
100 FOR T=0 TO 4:LOCATE T*3+3,1:PRINT A$(T);" ";:NEXT T:M1$=""
105 ZZ$=STR$(I(0)*10+I(1)*10+I(2)*10+I(3)*10+I(4))
106 IF ZZ$=" 111110" THEN CLS:M1$="Sci. mass.ma":P=P+350:GOTO 200
107 IF ZZ$=" 11111" THEN CLS:M1$="Sci. min.ma":P=P+180:GOTO 200
110 FOR T=LEN(ZZ$)-1 TO 1 STEP -1:Z$=MID$(ZZ$,LEN(ZZ$)-T,1)
120 IF Z$="5" THEN M$="all":P=P+500+T*10
130 IF Z$="4" THEN M$="Poker":P=P+400+T*10
140 IF Z$="3" THEN M$="Tris":P=P+300+T*10
150 IF Z$="2" THEN M$="Coppia":P=P+T*10
160 M1$=M1$+M$:M$="":NEXT T
170 IF M1$="Tris Coppia" THEN M1$="Full"
175 IF M1$="Coppia Coppia" THEN M1$="d. coppia"
180 IF M1$="Coppia Tris" THEN M1$="Full"
200 LOCATE 0,2:PRINT M1$;" ";P:IF Y=5 THEN 500 ELSE GOTO 210
210 O$=INKEY$:IF O$="" THEN LOCATE 0,3:PRINT " Press key":GOTO 210 ELSE GOTO 10
500 Y=0:S=S+1:R(S)=P:P=0:IF S<N THEN 600 ELSE GOTO 10
600 LOCATE 0,3:PRINT " Press key":A$=INKEY$:IF A$="" THEN 600
605 CLS
610 FOR T=1 TO N:LOCATE 0,T-1:PRINT T;".Gioc.";" R("T;):NEXT T
620 A$=INKEY$:IF A$="" THEN 620 ELSE 1
1000 X=INT(RND*6)+1:A$(K)=MID$(A$,X*2-1,2):I(K)=X:RETURN`;

    // --- CONFIGURAZIONE E COSTANTI ---
    const SILO_ID = 'fef8244a-32a1-49b4-8554-115925117c9f';
    const API_KEY = 'u0VUAKTKrki8rIBXnThaghXE5WHxqGXCRNpQjcW6bM';
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

    // --- ELEMENTI DOM (dichiarati esplicitamente per robustezza) ---
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
    
    // --- VARIABILI DI STATO ---
    let playerName = '', isShift = false, audioCtx, isMuted = false;
    let currentHand = [], handNumber = 1, totalScore = 0, gamePhase = 'deal', drawCount = 0;
    let typingInterval = null, currentAction = null;

    // --- MOTORE AUDIO SINTETIZZATO ---
    function initAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.error("Web Audio API non supportata."); } } }
    function playSound(type) { if (isMuted || !audioCtx) return; const now = audioCtx.currentTime; const gainNode = audioCtx.createGain(); gainNode.connect(audioCtx.destination); gainNode.gain.setValueAtTime(0.15, now); const osc = audioCtx.createOscillator(); osc.connect(gainNode); if (type === 'click') { osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1); osc.start(now); osc.stop(now + 0.1); } else if (type === 'win') { osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.1); gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2); osc.start(now); osc.stop(now + 0.2); } else if (type === 'spin') { let t = 0; for (let i = 0; i < 5; i++) { const o = audioCtx.createOscillator(); o.connect(gainNode); o.type = 'square'; o.frequency.setValueAtTime(1500, now + t); gainNode.gain.setValueAtTime(0.15, now + t); gainNode.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.05); o.start(now + t); o.stop(now + t + 0.05); t += 0.04; } } }
    
    // --- FUNZIONI DI GIOCO E LOGICA ---
    // (Tutto il blocco delle funzioni di gioco, da evaluateHand a showResult, rimane qui, invariato)
    function evaluateHand(hand) { const counts = {}; hand.forEach(card => { counts[card] = (counts[card] || 0) + 1; }); const groups = Object.entries(counts).map(([card, count]) => ({ card, cardValue: CARD_VALUES[card], count })).sort((a, b) => (b.count - a.count) || (b.cardValue - a.cardValue)); const mainGroup = groups[0]; if (mainGroup.count === 4) return { name: "Poker", points: 400 + mainGroup.cardValue * 4 }; if (mainGroup.count === 3 && groups[1]?.count === 2) return { name: "Full", points: 320 + mainGroup.cardValue * 3 + groups[1].cardValue * 2 }; if (mainGroup.count === 3) return { name: "Tris", points: 300 + mainGroup.cardValue * 3 }; if (mainGroup.count === 2 && groups[1]?.count === 2) return { name: "Doppia Coppia", points: 200 + mainGroup.cardValue * 2 + groups[1].cardValue * 2 }; if (mainGroup.count === 2) return { name: "Coppia", points: 100 + mainGroup.cardValue * 2 }; return { name: "Carta Alta", points: Math.max(...hand.map(c => CARD_VALUES[c])) }; }
    function updateDisplay() { handInfo.textContent = `Mano: ${handNumber}/5`; scoreInfo.textContent = `Punteggio: ${totalScore}`; cardElements.forEach((el, i) => { el.textContent = currentHand[i] || ''; }); }
    function showSection(sectionId) { ['name-input-section', 'game-section', 'leaderboard-section'].forEach(id => { document.getElementById(id).style.display = 'none'; }); document.getElementById(sectionId).style.display = 'flex'; virtualKeyboard.style.display = (sectionId === 'name-input-section') ? 'flex' : 'none'; }
    const FIREBASE_URL = 'https://slotpokerlivio-default-rtdb.firebaseio.com/leaderboard.json';

// Recupera la leaderboard da Firebase
async function getLeaderboard() {
    try {
        const response = await fetch(FIREBASE_URL);
        if (!response.ok) {
            console.error("Errore API GET Firebase:", response.status, await response.text());
            return [];
        }
        const data = await response.json();
        // Firebase restituisce un oggetto, lo trasformiamo in array
        if (!data) return [];
        return Object.values(data);
    } catch (e) {
        console.error("Errore di rete nel caricare la classifica:", e);
        return [];
    }
}

// Salva il punteggio su Firebase
async function saveScore(name, score) {
    let leaderboard = await getLeaderboard();
    const dateString = new Date().toLocaleDateString('it-IT');
    leaderboard.push({ name, score, date: dateString });
    leaderboard.sort((a, b) => b.score - a.score);

    try {
        // Sovrascrivi tutta la leaderboard
        const res = await fetch(FIREBASE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leaderboard)
        });
        if (!res.ok) throw new Error('Errore salvataggio Firebase');
    } catch (e) {
        console.error('Errore nel salvataggio su Firebase:', e);
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
    // Mostra il bottone "Gioca Ancora" e collega la funzione di avvio partita
    actionButton.style.display = 'inline-block';
    updateActionButton('Gioca Ancora', showNameScreen);
}
    function showNameScreen() { playerNameInput.value = localStorage.getItem('slotPokerLastName') || ''; showSection('name-input-section'); updateActionButton('Inizia a Giocare', startGame); }
    function updateActionButton(text, action) { actionButton.textContent = text; if (currentAction) actionButton.removeEventListener('click', currentAction); currentAction = action; actionButton.addEventListener('click', currentAction); }
    function startGame() { playerName = playerNameInput.value.trim(); if (playerName === '') { alert('Per favore, inserisci il tuo nome!'); return; } if (!audioCtx && !isMuted) initAudio(); localStorage.setItem('slotPokerLastName', playerName); handNumber = 1; totalScore = 0; showSection('game-section'); dealHand(); }
    function dealHand() { gamePhase = 'deal'; drawCount = 0; currentHand = Array(5).fill(null).map(() => DECK[Math.floor(Math.random() * DECK.length)]); cardElements.forEach(card => card.classList.remove('selected')); updateDisplay(); messageBox.textContent = `1° Cambio: Seleziona carte`; updateActionButton('Cambia', changeCards); }
    function animateAndChangeCards() { const cardsToChange = cardElements.map((card, index) => ({ card, index })).filter(c => c.card.classList.contains('selected')); if (cardsToChange.length === 0) { drawCount++; if (drawCount < 3) { messageBox.textContent = `${drawCount + 1}° Cambio: Seleziona carte`; } else { showResult(); } return; } playSound('spin'); actionButton.disabled = true; let animationCounter = 0; const animationInterval = setInterval(() => { animationCounter++; cardsToChange.forEach(c => { c.card.textContent = DECK[Math.floor(Math.random() * DECK.length)]; }); if (animationCounter > 10) { clearInterval(animationInterval); cardsToChange.forEach(c => { currentHand[c.index] = DECK[Math.floor(Math.random() * DECK.length)]; }); cardElements.forEach(card => card.classList.remove('selected')); updateDisplay(); drawCount++; if (drawCount < 3) { messageBox.textContent = `${drawCount + 1}° Cambio: Seleziona carte`; } else { showResult(); } actionButton.disabled = false; } }, 50); }
    function changeCards() { if (gamePhase === 'deal') animateAndChangeCards(); }
    function showResult() { gamePhase = 'result'; const result = evaluateHand(currentHand); if (result.points > 100) playSound('win'); totalScore += result.points; updateDisplay(); messageBox.textContent = `Risultato: ${result.name} (+${result.points} p.)`; if (handNumber < 5) { updateActionButton('Prossima Mano', () => { handNumber++; dealHand(); }); } else { actionButton.style.display = 'none'; messageBox.textContent += ` | Partita Finita!`; saveScore(playerName, totalScore).then(() => setTimeout(displayLeaderboard, 2000)); } }
    
    // --- TASTIERA VIRTUALE ---
    function createVirtualKeyboard() {
        virtualKeyboard.innerHTML = '';
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
            virtualKeyboard.appendChild(rowDiv);
        });
    }
    
    // --- FUNZIONI DI UTILITY E INIZIALIZZAZIONE ---
    function applyStyles() { screenOverlay.style.top = `${config.screen.top}%`; screenOverlay.style.left = `${config.screen.left}%`; screenOverlay.style.width = `${config.screen.width}%`; screenOverlay.style.height = `${config.screen.height}%`; virtualKeyboard.style.top = `${config.keyboard.top}%`; virtualKeyboard.style.left = `${config.keyboard.left}%`; virtualKeyboard.style.width = `${config.keyboard.width}%`; virtualKeyboard.style.height = `${config.keyboard.height}%`; virtualKeyboard.style.opacity = config.keyboard.opacity / 100; gameContainer.style.transform = `scale(${config.zoom / 100})`; }
    
    function initTuningMode() {
        const closePanelOnClickOutside = (event) => { if (!tuningPanel.contains(event.target) && event.target !== tuningToggle) { tuningPanel.style.display = 'none'; window.removeEventListener('click', closePanelOnClickOutside); } };
        tuningToggle.addEventListener('click', (event) => { event.stopPropagation(); const isVisible = tuningPanel.style.display === 'block'; tuningPanel.style.display = isVisible ? 'none' : 'block'; if (!isVisible) { setTimeout(() => window.addEventListener('click', closePanelOnClickOutside), 0); } else { window.removeEventListener('click', closePanelOnClickOutside); } });
        
        const controls = [
            { id: 'sTop', obj: 'screen', prop: 'top', label: 'Scr Top' }, { id: 'sLeft', obj: 'screen', prop: 'left', label: 'Scr Left' },
            { id: 'sWidth', obj: 'screen', prop: 'width', label: 'Scr Width' }, { id: 'sHeight', obj: 'screen', prop: 'height', label: 'Scr Height' },
            { id: 'kTop', obj: 'keyboard', prop: 'top', label: 'Keyb Top' }, { id: 'kLeft', obj: 'keyboard', prop: 'left', label: 'Keyb Left' },
            { id: 'kWidth', obj: 'keyboard', prop: 'width', label: 'Keyb Width' }, { id: 'kHeight', obj: 'keyboard', prop: 'height', label: 'Keyb Height' },
            { id: 'kOpacity', obj: 'keyboard', prop: 'opacity', label: 'Keyb Opacity' }, { id: 'zoom', obj: null, prop: 'zoom', label: 'Zoom' }
        ];

        tuningPanel.innerHTML = `<div><strong>Pannello Calibrazione</strong></div>` + controls.map(c => `<div><label for="${c.id}">${c.label}:</label> <input type="range" id="${c.id}" min="0" max="150" value="${c.obj ? config[c.obj][c.prop] : config[c.prop]}"> <span id="${c.id}-val"></span></div>`).join('');
        
        controls.forEach(c => {
            const slider = document.getElementById(c.id);
            const valueSpan = document.getElementById(`${c.id}-val`);
            const updateValue = () => { const target = c.obj ? config[c.obj] : config; target[c.prop] = slider.value; valueSpan.textContent = `${slider.value}${ c.prop !== 'zoom' ? '%' : ''}`; applyStyles(); };
            slider.addEventListener('input', updateValue);
            updateValue();
        });
    }

    function initTerminalMode() {
        function typeOutCode(code, element, speed = 15) { let i = 0; element.innerHTML = ''; const cursor = document.createElement('span'); cursor.className = 'blinking-cursor'; element.appendChild(cursor); function type() { if (i < code.length) { element.insertBefore(document.createTextNode(code[i]), cursor); i++; typingInterval = setTimeout(type, speed); } } type(); }
        sourceToggleButton.addEventListener('click', () => { gameContainer.style.opacity = '0'; terminalOverlay.style.display = 'block'; setTimeout(() => terminalOverlay.style.opacity = '1', 10); typeOutCode(original_basic_code, codeDisplay); });
        closeTerminalButton.addEventListener('click', () => { clearTimeout(typingInterval); terminalOverlay.style.opacity = '0'; setTimeout(() => { terminalOverlay.style.display = 'none'; gameContainer.style.opacity = '1'; }, 500); });
    }

    // Funzione di avvio principale
    function init() {
        applyStyles();
        createVirtualKeyboard();
        initTuningMode();
        initTerminalMode();
        showNameScreen();

        // Imposta icona audio attiva all'avvio
        soundToggleButton.textContent = '🔊';

        soundToggleButton.addEventListener('click', () => {
            isMuted = !isMuted;
            soundToggleButton.textContent = isMuted ? '🔇' : '🔊';
            if (!isMuted && !audioCtx) { initAudio(); }
            if (!isMuted) playSound('click');
        });

        cardElements.forEach(card => card.addEventListener('click', () => { if (gamePhase === 'deal') { card.classList.toggle('selected'); playSound('click'); } }));
        playerNameInput.addEventListener('input', () => { playerName = playerNameInput.value; });
        playerNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); actionButton.click(); } });
        virtualKeyboard.addEventListener('click', (event) => { const key = event.target.dataset.key; if (!key) return; playSound('click'); switch(key) { case 'DEL': playerNameInput.value = playerNameInput.value.slice(0, -1); break; case 'ENTER': actionButton.click(); break; case 'SHIFT': isShift = !isShift; break; case ' ': if (playerNameInput.value.length < MAX_NAME_LENGTH) playerNameInput.value += ' '; break; default: if (playerNameInput.value.length < MAX_NAME_LENGTH) { playerNameInput.value += isShift ? key.toUpperCase() : key.toLowerCase(); } break; } });
    }

    init();
});
