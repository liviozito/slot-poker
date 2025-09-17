document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAZIONE E COSTANTI ---
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

    const SILO_ID = 'fef8244a-32a1-49b4-8554-115925117c9f';
    const API_KEY = 'dqbKXp5bWCc8D6hHAq23GhuBer2Gd2qFs813iBQYXT';
    const SILO_URL = `https://api.jsonsilo.com/${SILO_ID}`;
    
    const DECK = ['7', '8', '9', 'D', 'J', 'Q', 'K', 'A'];
    const CARD_VALUES = { '7': 7, '8': 8, '9': 9, 'D': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    const MAX_LEADERBOARD_ENTRIES = 3;
    const MAX_NAME_LENGTH = 15;
    const KEY_LAYOUT = ["QWERTYUIOP", "ASDFGHJKL", "SHIFT ZXCVBNM DEL", "  ENTER"];
    const config = {
        screen: { top: 5, left: 3, width: 67, height: 60 },
        keyboard: { top: 66, left: 4, width: 92, height: 29, opacity: 50 },
        zoom: 100
    };

    // Elementi DOM
    const gameContainer = document.getElementById('game-container');
    const screenOverlay = document.getElementById('screen-overlay');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    const playerNameInput = document.getElementById('player-name');
    const actionButton = document.getElementById('action-button');
    const soundToggleButton = document.getElementById('sound-toggle-button');
    const sourceToggleButton = document.getElementById('source-toggle-button');
    const tuningToggle = document.getElementById('tuning-toggle-button');
    const tuningPanel = document.getElementById('tuning-panel'); // Corretto
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
    
    // Variabili di stato
    let playerName = '', isShift = false, audioCtx, isMuted = true;
    let currentHand = [], handNumber = 1, totalScore = 0, gamePhase = 'deal', drawCount = 0;
    let typingInterval = null, currentAction = null;

    // --- MOTORE AUDIO SINTETIZZATO ---
    function initAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.error("Web Audio API non supportata."); } } }
    function playSound(type) { /* ... Codice audio invariato ... */ }
    
    // --- FUNZIONI DI GIOCO E LOGICA ---
    function evaluateHand(hand) { /* ... Codice valutazione invariato ... */ }
    function updateDisplay() { /* ... Codice display invariato ... */ }
    function showSection(sectionId) { ['name-input-section', 'game-section', 'leaderboard-section'].forEach(id => { document.getElementById(id).style.display = 'none'; }); document.getElementById(sectionId).style.display = 'flex'; virtualKeyboard.style.display = (sectionId === 'name-input-section') ? 'flex' : 'none'; }
    
    async function getLeaderboard() { /* ... Codice classifica invariato ... */ }
    async function saveScore(name, score) { /* ... Codice classifica invariato ... */ }
    async function displayLeaderboard() { /* ... Codice classifica invariato ... */ }
    
    function showNameScreen() { playerNameInput.value = localStorage.getItem('slotPokerLastName') || ''; showSection('name-input-section'); updateActionButton('Inizia a Giocare', startGame); }
    function updateActionButton(text, action) { actionButton.textContent = text; if (currentAction) actionButton.removeEventListener('click', currentAction); currentAction = action; actionButton.addEventListener('click', currentAction); }
    function startGame() { playerName = playerNameInput.value.trim(); if (playerName === '') { alert('Per favore, inserisci il tuo nome!'); return; } if (!audioCtx && !isMuted) initAudio(); localStorage.setItem('slotPokerLastName', playerName); handNumber = 1; totalScore = 0; showSection('game-section'); dealHand(); }
    function dealHand() { /* ... Codice dealHand invariato ... */ }
    function animateAndChangeCards() { /* ... Codice animazione invariato ... */ }
    function changeCards() { if (gamePhase === 'deal') animateAndChangeCards(); }
    function showResult() { /* ... Codice showResult invariato ... */ }
    
    // --- TASTIERA VIRTUALE ---
    function createVirtualKeyboard() { virtualKeyboard.innerHTML = ''; KEY_LAYOUT.forEach(rowString => { const rowDiv = document.createElement('div'); rowDiv.className = 'keyboard-row'; const keys = rowString.split(' '); if (keys.length > 1) { keys.forEach(keySymbol => { const keyDiv = document.createElement('div'); keyDiv.className = 'key'; keyDiv.dataset.key = keySymbol; if (keySymbol.length > 1) keyDiv.textContent = keySymbol; rowDiv.appendChild(keyDiv); }); } else { rowString.split('').forEach(char => { const keyDiv = document.createElement('div'); keyDiv.className = 'key'; keyDiv.dataset.key = char; keyDiv.textContent = char; rowDiv.appendChild(keyDiv); }); } virtualKeyboard.appendChild(rowDiv); }); }
    
    // --- FUNZIONI DI UTILITY E INIZIALIZZAZIONE ---
    function applyStyles() { /* ... Codice applyStyles invariato ... */ }
    function initTuningMode() { /* ... Codice tuning invariato, ma ora funzionante ... */ }
    function initTerminalMode() { /* ... Codice terminale invariato, ma ora funzionante ... */ }

    // Funzione di avvio principale
    function init() {
        createVirtualKeyboard();
        applyStyles();
        initTuningMode();
        initTerminalMode();
        showNameScreen();
        soundToggleButton.addEventListener('click', () => { isMuted = !isMuted; soundToggleButton.textContent = isMuted ? '🔇' : '🔊'; if (!isMuted && !audioCtx) { initAudio(); } if (!isMuted) playSound('click'); });
        cardElements.forEach(card => card.addEventListener('click', () => { if (gamePhase === 'deal') { card.classList.toggle('selected'); playSound('click'); } }));
        playerNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); actionButton.click(); } });
        virtualKeyboard.addEventListener('click', (event) => { const key = event.target.dataset.key; if (!key) return; playSound('click'); switch(key) { case 'DEL': playerNameInput.value = playerNameInput.value.slice(0, -1); break; case 'ENTER': actionButton.click(); break; case 'SHIFT': isShift = !isShift; break; case ' ': if (playerNameInput.value.length < MAX_NAME_LENGTH) playerNameInput.value += ' '; break; default: if (playerNameInput.value.length < MAX_NAME_LENGTH) { playerNameInput.value += isShift ? key.toUpperCase() : key.toLowerCase(); } break; } });
    }

    init(); // Avvia tutto
});
