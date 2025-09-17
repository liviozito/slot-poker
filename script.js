document.addEventListener('DOMContentLoaded', () => {

    // --- CODICE SORGENTE ORIGINALE DEL 1988 ---
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
    
    const tuningToggle = document.getElementById('tuning-toggle-button');
    const panel = document.getElementById('tuning-panel');
    
    function closePanelOnClickOutside(event) {
        if (!panel.contains(event.target) && event.target !== tuningToggle) {
            panel.style.display = 'none';
            window.removeEventListener('click', closePanelOnClickOutside);
        }
    }

    function initTuningMode() {
        tuningToggle.addEventListener('click', () => {
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                setTimeout(() => window.addEventListener('click', closePanelOnClickOutside), 0);
            } else {
                window.removeEventListener('click', closePanelOnClickOutside);
            }
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

    // --- GESTIONE SUONI ---
    const soundToggleButton = document.getElementById('sound-toggle-button');
    const sounds = {
        click: new Audio('https://sfxcontent.s3.amazonaws.com/sound-effects/UI-CLICK-1.wav'),
        spin: new Audio('https://sfxcontent.s3.amazonaws.com/sound-effects/digital-UI-fast-scroll.wav'),
        win: new Audio('https://sfxcontent.s3.amazonaws.com/sound-effects/short-success-sound-glockenspiel-treasure-video-game.wav')
    };
    
    let audioCtx;
    let isMuted = true;

    function initAudio() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) { console.error("Web Audio API non supportata."); }
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

    function playSound(soundName) {
        if (isMuted || !sounds[soundName]) return;
        sounds[soundName].volume = 0.5;
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.error(`Errore audio: ${e}`));
    }
    
    // --- GESTIONE TERMINALE FANTASMA ---
    const sourceToggleButton = document.getElementById('source-toggle-button');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const codeDisplay = document.getElementById('code-display');
    const closeTerminalButton = document.getElementById('close-terminal-button');
    let typingInterval = null;

    function typeOutCode(code, element) {
        let index = 0;
        element.innerHTML = ''; // Pulisce il contenuto precedente
        const cursor = document.createElement('span');
        cursor.className = 'blinking-cursor';
        element.appendChild(cursor);

        typingInterval = setInterval(() => {
            if (index < code.length) {
                element.insertBefore(document.createTextNode(code[index]), cursor);
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, 10); // Velocità di scrittura
    }

    sourceToggleButton.addEventListener('click', () => {
        terminalOverlay.style.display = 'block';
        typeOutCode(original_basic_code, codeDisplay);
    });

    closeTerminalButton.addEventListener('click', () => {
        clearInterval(typingInterval); // Interrompe la scrittura se in corso
        terminalOverlay.style.display = 'none';
    });

    // --- IL RESTO DEL GIOCO (invariato)---
    // ... (tutto il codice del gioco da "const cardElements" in poi rimane qui, identico a prima)
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
        // Logica per leggere la classifica...
    }

    async function saveScore(name, score) {
        // Logica per salvare la classifica...
    }
    
    async function displayLeaderboard() {
        // Logica per mostrare la classifica...
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
