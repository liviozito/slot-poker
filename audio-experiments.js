// === TEST AUDIO PER IL PULSANTE </> ===
// File separato per sperimentare diverse soluzioni audio
// Copia e incolla le funzioni che vuoi testare nel tuo script principale

// ==============================================
// ESPERIMENTO 1: AUDIO GENERATO DINAMICAMENTE
// ==============================================

function createAudioExperiment1() {
    updateGlobalDebugDisplay("🧪 Esperimento 1: Audio generato dinamicamente");
    
    // Crea un suono Matrix-style usando solo Web Audio API
    function playMatrixSound() {
        updateGlobalDebugDisplay("🎛️ Inizializzazione Web Audio Context...");
        
        if (!window.audioCtx) {
            try {
                window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                updateGlobalDebugDisplay("✅ AudioContext creato con successo");
            } catch (e) {
                updateGlobalDebugDisplay(`❌ Web Audio API non supportata: ${e.message}`);
                return;
            }
        }
        
        const ctx = window.audioCtx;
        const now = ctx.currentTime;
        updateGlobalDebugDisplay(`🎵 Generazione sequenza beep (tempo: ${now.toFixed(2)}s)`);
        
        // Sequenza di beep simili ai computer degli anni '80
        const frequencies = [800, 1000, 1200, 1000, 800];
        
        frequencies.forEach((freq, i) => {
            updateGlobalDebugDisplay(`🔊 Beep ${i+1}: ${freq}Hz a ${(now + i * 0.1).toFixed(2)}s`);
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            
            gain.gain.setValueAtTime(0.1, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.08);
        });
        
        updateGlobalDebugDisplay("✅ Sequenza Web Audio avviata!");
    }
    
    return playMatrixSound;
}

// ==============================================
// ESPERIMENTO 2: AUDIO DA URL ESTERNI SICURI (CON DEBUG ESTESO)
// ==============================================

function createAudioExperiment2() {
    console.log("🧪 Esperimento 2: Audio da CDN esterni");
    
    const audioUrls = [
        "https://www.soundjay.com/misc/sounds/beep-07a.wav",
        "https://www.soundjay.com/misc/sounds/beep-10.wav", 
        "https://freesound.org/data/previews/316/316847_5123451-lq.mp3",
        "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/cartoon_pop_bubbles_multi_layer_01.mp3",
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    ];
    
    let workingAudio = null;
    let debugInfo = [];
    
    // Funzione per creare il display di debug
    function createDebugDisplay() {
        let debugDiv = document.getElementById('audio-debug');
        if (!debugDiv) {
            debugDiv = document.createElement('div');
            debugDiv.id = 'audio-debug';
            debugDiv.style.cssText = `
                position: fixed; top: 10px; right: 10px; 
                background: rgba(0,0,0,0.8); color: #00ff00; 
                padding: 10px; font-family: monospace; 
                font-size: 12px; max-width: 400px;
                border: 1px solid #00ff00; z-index: 9999;
            `;
            document.body.appendChild(debugDiv);
        }
        return debugDiv;
    }
    
    function updateDebugDisplay(message) {
        const debugDiv = createDebugDisplay();
        debugInfo.push(`[${new Date().toLocaleTimeString()}] ${message}`);
        debugDiv.innerHTML = '<strong>AUDIO DEBUG:</strong><br>' + debugInfo.slice(-10).join('<br>');
        console.log(`[AUDIO DEBUG] ${message}`);
    }
    
    // Testa quale URL funziona con debug dettagliato
    async function findWorkingAudio() {
        updateDebugDisplay("Iniziando test audio esterni...");
        
        for (let i = 0; i < audioUrls.length; i++) {
            const url = audioUrls[i];
            updateDebugDisplay(`Test ${i+1}/${audioUrls.length}: ${url.substring(0, 50)}...`);
            
            try {
                const audio = new Audio();
                
                // Event listeners dettagliati
                audio.addEventListener('loadstart', () => updateDebugDisplay(`🔄 Loadstart: ${url}`));
                audio.addEventListener('loadedmetadata', () => updateDebugDisplay(`📊 Metadata caricati: ${url}`));
                audio.addEventListener('loadeddata', () => updateDebugDisplay(`📦 Dati caricati: ${url}`));
                audio.addEventListener('canplay', () => updateDebugDisplay(`▶️ CanPlay: ${url}`));
                audio.addEventListener('canplaythrough', () => updateDebugDisplay(`✅ CanPlayThrough: ${url}`));
                
                audio.crossOrigin = "anonymous";
                updateDebugDisplay(`🌐 CORS impostato per: ${url}`);
                
                const loadPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Timeout 10s'));
                    }, 10000);
                    
                    audio.addEventListener('canplaythrough', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                    
                    audio.addEventListener('error', (e) => {
                        clearTimeout(timeout);
                        reject(e);
                    });
                });
                
                audio.src = url;
                updateDebugDisplay(`📡 SRC impostato: ${url}`);
                
                await loadPromise;
                
                updateDebugDisplay(`🎉 SUCCESSO! Audio funzionante: ${url}`);
                workingAudio = audio;
                workingAudio.volume = 0.5;
                return audio;
                
            } catch (e) {
                updateDebugDisplay(`❌ ERRORE ${url}: ${e.message}`);
                
                // Testa anche con fetch per vedere se il file esiste
                try {
                    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                    updateDebugDisplay(`🔍 Fetch HEAD test: ${response.type === 'opaque' ? 'File esistente (CORS bloccato)' : response.status}`);
                } catch (fetchError) {
                    updateDebugDisplay(`🔍 Fetch test fallito: ${fetchError.message}`);
                }
            }
        }
        
        updateDebugDisplay("❌ TUTTI I TEST FALLITI - Nessun audio esterno disponibile");
        return null;
    }
    
    async function playExternalSound() {
        updateDebugDisplay("🎵 Richiesta riproduzione audio...");
        
        if (!workingAudio) {
            updateDebugDisplay("🔍 Nessun audio precaricato, ricerca in corso...");
            await findWorkingAudio();
        }
        
        if (workingAudio) {
            try {
                workingAudio.currentTime = 0;
                updateDebugDisplay(`▶️ Tentativo play() su: ${workingAudio.src}`);
                
                const playPromise = workingAudio.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => updateDebugDisplay("🎵 RIPRODUZIONE INIZIATA!"))
                        .catch(e => updateDebugDisplay(`❌ Play() fallito: ${e.message}`));
                } else {
                    updateDebugDisplay("🎵 Play() sincrono (browser vecchio)");
                }
            } catch (e) {
                updateDebugDisplay(`❌ Errore durante play(): ${e.message}`);
            }
        } else {
            updateDebugDisplay("❌ Nessun audio disponibile per la riproduzione");
        }
    }
    
    // Inizializza al caricamento
    updateDebugDisplay("🚀 Inizializzazione esperimento audio esterni...");
    findWorkingAudio();
    
    return playExternalSound;
}

// ==============================================
// ESPERIMENTO 3: AUDIO BASE64 EMBEDDED
// ==============================================

function createAudioExperiment3() {
    console.log("🧪 Esperimento 3: Audio embedded in base64");
    
    // Mini file WAV generato programmaticamente (1 secondo di beep)
    function generateWavBase64() {
        const sampleRate = 44100;
        const duration = 0.5; // 500ms
        const samples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // Header WAV
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Genera beep a 800Hz
        for (let i = 0; i < samples; i++) {
            const sample = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.3;
            view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        // Converti in base64
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        return 'data:audio/wav;base64,' + btoa(binary);
    }
    
    const embeddedAudio = new Audio(generateWavBase64());
    embeddedAudio.volume = 0.5;
    
    function playEmbeddedSound() {
        embeddedAudio.currentTime = 0;
        embeddedAudio.play().catch(e => console.warn("Errore audio embedded:", e));
    }
    
    return playEmbeddedSound;
}

// ==============================================
// ESPERIMENTO 4: SEQUENZA AUDIO COMPLESSA
// ==============================================

function createAudioExperiment4() {
    console.log("🧪 Esperimento 4: Sequenza audio stile Matrix/Hacker");
    
    function playHackerSequence() {
        if (!window.audioCtx) {
            try {
                window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return;
            }
        }
        
        const ctx = window.audioCtx;
        const now = ctx.currentTime;
        
        // Sequenza che simula "accesso al sistema"
        const sequence = [
            { freq: 1200, duration: 0.1, delay: 0 },      // Beep iniziale
            { freq: 800, duration: 0.05, delay: 0.15 },   // Conferma
            { freq: 1000, duration: 0.05, delay: 0.25 },  // Processo
            { freq: 1500, duration: 0.2, delay: 0.35 },   // Accesso concesso
        ];
        
        sequence.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.freq, now + note.delay);
            
            gain.gain.setValueAtTime(0.15, now + note.delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.duration);
            
            osc.start(now + note.delay);
            osc.stop(now + note.delay + note.duration);
        });
        
        // Aggiunge un po' di "rumore digitale"
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'square';
                osc.frequency.setValueAtTime(2000 + Math.random() * 1000, now + 0.6 + i * 0.02);
                
                gain.gain.setValueAtTime(0.05, now + 0.6 + i * 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.02 + 0.01);
                
                osc.start(now + 0.6 + i * 0.02);
                osc.stop(now + 0.6 + i * 0.02 + 0.01);
            }
        }, 100);
    }
    
    return playHackerSequence;
}

// ==============================================
// ESPERIMENTO 5: SPEECH SYNTHESIS (VOCE)
// ==============================================

function createAudioExperiment5() {
    console.log("🧪 Esperimento 5: Sintesi vocale");
    
    function speakMatrixQuote() {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance("Welcome to the Matrix");
            utterance.rate = 0.8;
            utterance.pitch = 0.7;
            utterance.volume = 0.5;
            
            // Cerca una voce inglese o usa la prima disponibile
            const voices = speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => voice.lang.includes('en')) || voices[0];
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            speechSynthesis.speak(utterance);
        } else {
            console.warn("Speech Synthesis non supportato");
        }
    }
    
    return speakMatrixQuote;
}

// ==============================================
// FUNZIONE DI TEST PER PROVARE TUTTI GLI ESPERIMENTI
// ==============================================

// Funzione per aggiornare il debug display (condivisa)
function updateGlobalDebugDisplay(message) {
    let debugDiv = document.getElementById('audio-debug');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'audio-debug';
        debugDiv.style.cssText = `
            position: fixed; top: 10px; right: 10px; 
            background: rgba(0,0,0,0.8); color: #00ff00; 
            padding: 10px; font-family: monospace; 
            font-size: 12px; max-width: 400px;
            border: 1px solid #00ff00; z-index: 9999;
            max-height: 400px; overflow-y: auto;
        `;
        document.body.appendChild(debugDiv);
    }
    
    if (!window.debugMessages) window.debugMessages = [];
    window.debugMessages.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    debugDiv.innerHTML = '<strong>AUDIO DEBUG:</strong><br>' + window.debugMessages.slice(-20).join('<br>');
    console.log(`[AUDIO DEBUG] ${message}`);
}

function testAllAudioExperiments() {
    updateGlobalDebugDisplay("🎵 INIZIO TEST AUDIO EXPERIMENTS");
    
    const experiments = [
        { name: "Web Audio API", fn: createAudioExperiment1() },
        { name: "Audio Esterno", fn: createAudioExperiment2() },
        { name: "Audio Embedded", fn: createAudioExperiment3() },
        { name: "Sequenza Complessa", fn: createAudioExperiment4() },
        { name: "Sintesi Vocale", fn: createAudioExperiment5() }
    ];
    
    experiments.forEach((exp, index) => {
        setTimeout(() => {
            updateGlobalDebugDisplay(`🎧 Test ${index + 1}: ${exp.name}`);
            try {
                exp.fn();
                updateGlobalDebugDisplay(`✅ Esperimento ${exp.name} eseguito`);
            } catch (e) {
                updateGlobalDebugDisplay(`❌ Errore esperimento ${exp.name}: ${e.message}`);
                console.error(`❌ Errore esperimento ${exp.name}:`, e);
            }
        }, index * 3000); // 3 secondi tra un test e l'altro
    });
}

// Aggiungi pulsante per pulire il debug
function clearDebug() {
    const debugDiv = document.getElementById('audio-debug');
    if (debugDiv) debugDiv.remove();
    window.debugMessages = [];
    console.clear();
    updateGlobalDebugDisplay("🧹 Debug pulito");
}

// ==============================================
// COME INTEGRARE NEL TUO CODICE PRINCIPALE
// ==============================================

/*
// Sostituisci la sezione audio nel sourceToggleButton con una di queste:

sourceToggleButton.addEventListener('click', () => {
    gameContainer.style.opacity = '0';
    terminalOverlay.style.display = 'block';
    setTimeout(() => terminalOverlay.style.opacity = '1', 10);
    typeOutCode(original_basic_code, codeDisplay);

    // SCEGLI UNO DEGLI ESPERIMENTI:
    if (!isMuted) {
        // createAudioExperiment1()(); // Web Audio API
        // createAudioExperiment2()(); // Audio esterno
        // createAudioExperiment3()(); // Audio embedded
        createAudioExperiment4()(); // Sequenza complessa (CONSIGLIATO)
        // createAudioExperiment5()(); // Sintesi vocale
    }
});
*/

// ==============================================
// ESPORTA LE FUNZIONI PER I TEST
// ==============================================

// Per testare dalla console del browser:
window.testAudio1 = createAudioExperiment1();
window.testAudio2 = createAudioExperiment2();
window.testAudio3 = createAudioExperiment3();
window.testAudio4 = createAudioExperiment4();
window.testAudio5 = createAudioExperiment5();
window.testAllAudio = testAllAudioExperiments;
window.clearDebug = clearDebug;

// Inizializza il debug
updateGlobalDebugDisplay("🚀 Sistema di debug audio inizializzato");

console.log(`
🎵 AUDIO EXPERIMENTS CARICATI CON DEBUG COMPLETO!

Dalla console puoi testare:
- testAudio1() - Web Audio API semplice
- testAudio2() - Audio da URL esterni (CON TRACE COMPLETO)
- testAudio3() - Audio embedded base64
- testAudio4() - Sequenza Matrix-style
- testAudio5() - Sintesi vocale
- testAllAudio() - Testa tutti in sequenza
- clearDebug() - Pulisce il pannello debug

VEDRAI UN PANNELLO DEBUG IN ALTO A DESTRA che ti mostrerà:
- Ogni tentativo di caricamento
- Gli errori esatti
- Lo stato di ogni operazione
- I tempi di esecuzione
- Le risposte del server

Il più affidabile è testAudio4() perché non dipende da file esterni!
`);