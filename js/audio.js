// ============================================================
// VERDANT HOLLOW — Procedural Audio System
// ============================================================

const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let sfxGain = null;
    let musicGain = null;
    let currentMusic = null;
    let musicTimeout = null;
    let initialized = false;

    function init() {
        if (initialized) return;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.5;
            masterGain.connect(ctx.destination);

            sfxGain = ctx.createGain();
            sfxGain.gain.value = 0.6;
            sfxGain.connect(masterGain);

            musicGain = ctx.createGain();
            musicGain.gain.value = 0.15;
            musicGain.connect(masterGain);

            initialized = true;
        } catch (e) {
            console.warn('Web Audio not available');
        }
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    function playNote(freq, duration, type, gain, dest, delay) {
        if (!ctx) return;
        const t = ctx.currentTime + (delay || 0);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(gain || 0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(g);
        g.connect(dest || sfxGain);
        osc.start(t);
        osc.stop(t + duration);
    }

    function playNoise(duration, gain, filterFreq, dest, delay) {
        if (!ctx) return;
        const t = ctx.currentTime + (delay || 0);
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain || 0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);

        if (filterFreq) {
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq, t);
            source.connect(filter);
            filter.connect(g);
        } else {
            source.connect(g);
        }
        g.connect(dest || sfxGain);
        source.start(t);
    }

    const sfx = {
        walk() {
            playNote(50, 0.05, 'sine', 0.08);
        },
        hoe() {
            playNoise(0.08, 0.15, 800);
            playNote(80, 0.08, 'sawtooth', 0.1);
        },
        water() {
            playNoise(0.15, 0.12, 2000);
            playNote(300, 0.1, 'sine', 0.05, null, 0.03);
        },
        plant() {
            playNote(400, 0.12, 'sine', 0.15);
            playNote(600, 0.08, 'sine', 0.1, null, 0.06);
        },
        harvest() {
            playNote(500, 0.1, 'sine', 0.2);
            playNote(650, 0.1, 'sine', 0.18, null, 0.08);
            playNote(800, 0.12, 'sine', 0.15, null, 0.16);
        },
        hit() {
            playNote(200, 0.06, 'sawtooth', 0.25);
            playNoise(0.04, 0.15, 1500);
        },
        playerHit() {
            playNote(150, 0.08, 'sawtooth', 0.2);
            playNoise(0.06, 0.12, 800);
        },
        death() {
            if (!ctx) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.5);
            g.gain.setValueAtTime(0.2, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(g);
            g.connect(sfxGain);
            osc.start(t);
            osc.stop(t + 0.5);
        },
        coin() {
            playNote(800, 0.15, 'sine', 0.15);
            playNote(1200, 0.1, 'sine', 0.1, null, 0.06);
        },
        open() {
            playNote(1000, 0.03, 'square', 0.08);
        },
        close() {
            playNote(800, 0.03, 'square', 0.06);
        },
        select() {
            playNote(600, 0.02, 'sine', 0.1);
        },
        error() {
            playNote(100, 0.2, 'sawtooth', 0.15);
        },
        chest() {
            playNote(600, 0.1, 'sine', 0.2);
            playNote(900, 0.1, 'sine', 0.15, null, 0.08);
            playNote(1200, 0.12, 'sine', 0.12, null, 0.16);
        },
        craft() {
            playNoise(0.05, 0.2, 3000);
            playNote(300, 0.12, 'sine', 0.15, null, 0.03);
            playNote(450, 0.1, 'sine', 0.12, null, 0.1);
        },
        doorEnter() {
            playNoise(0.2, 0.08, 600);
            playNote(200, 0.15, 'sine', 0.06);
        },
        levelUp() {
            playNote(523, 0.12, 'sine', 0.2);
            playNote(659, 0.12, 'sine', 0.18, null, 0.1);
            playNote(784, 0.12, 'sine', 0.16, null, 0.2);
            playNote(1047, 0.2, 'sine', 0.2, null, 0.3);
        },
        sell() {
            playNote(600, 0.08, 'sine', 0.15);
            playNote(800, 0.08, 'sine', 0.12, null, 0.05);
            playNote(1000, 0.1, 'sine', 0.1, null, 0.1);
        },
        fishBite() {
            playNote(800, 0.05, 'sine', 0.2);
            playNote(1000, 0.05, 'sine', 0.15, null, 0.05);
        },
        fishCatch() {
            playNote(600, 0.1, 'sine', 0.2);
            playNote(800, 0.1, 'sine', 0.18, null, 0.08);
            playNote(1000, 0.1, 'sine', 0.15, null, 0.16);
            playNote(1200, 0.15, 'sine', 0.2, null, 0.24);
        },
        fishEscape() {
            playNote(400, 0.15, 'sawtooth', 0.1);
            playNote(200, 0.2, 'sawtooth', 0.08, null, 0.1);
        },
        equip() {
            playNote(500, 0.06, 'sine', 0.15);
            playNote(700, 0.08, 'sine', 0.12, null, 0.04);
        }
    };

    // Music system — simple procedural loops
    const musicPatterns = {
        farm: {
            notes: [
                [392, 0.3], [440, 0.3], [494, 0.3], [523, 0.6],
                [494, 0.3], [440, 0.3], [392, 0.6], [0, 0.3],
                [330, 0.3], [392, 0.3], [440, 0.3], [494, 0.6],
                [440, 0.3], [392, 0.3], [330, 0.6], [0, 0.3]
            ],
            tempo: 0.25,
            type: 'sine'
        },
        house: {
            notes: [
                [262, 0.6], [330, 0.6], [392, 0.6], [330, 0.6],
                [294, 0.6], [349, 0.6], [440, 0.6], [349, 0.6]
            ],
            tempo: 0.4,
            type: 'triangle'
        },
        dungeon: {
            notes: [
                [165, 0.4], [196, 0.4], [175, 0.4], [147, 0.8],
                [165, 0.4], [131, 0.4], [147, 0.4], [110, 0.8],
                [165, 0.4], [175, 0.4], [196, 0.4], [175, 0.8],
                [147, 0.4], [165, 0.4], [131, 0.8], [0, 0.4]
            ],
            tempo: 0.3,
            type: 'sawtooth'
        },
        combat: {
            notes: [
                [220, 0.2], [262, 0.2], [220, 0.2], [196, 0.2],
                [220, 0.2], [330, 0.2], [294, 0.4],
                [220, 0.2], [262, 0.2], [294, 0.2], [262, 0.2],
                [220, 0.2], [196, 0.2], [175, 0.4]
            ],
            tempo: 0.15,
            type: 'square'
        },
        title: {
            notes: [
                [392, 0.4], [494, 0.4], [587, 0.4], [784, 0.8],
                [698, 0.4], [587, 0.4], [494, 0.4], [392, 0.8],
                [330, 0.4], [392, 0.4], [494, 0.4], [587, 0.8],
                [494, 0.4], [392, 0.4], [330, 0.8], [0, 0.4]
            ],
            tempo: 0.3,
            type: 'sine'
        }
    };

    let currentMusicName = null;

    function playMusic(name) {
        if (!ctx || currentMusicName === name) return;
        stopMusic();
        currentMusicName = name;
        const pattern = musicPatterns[name];
        if (!pattern) return;

        let noteIndex = 0;
        function scheduleNext() {
            if (currentMusicName !== name) return;
            const [freq, dur] = pattern.notes[noteIndex];
            if (freq > 0) {
                playNote(freq, dur * pattern.tempo * 2, pattern.type, 0.12, musicGain);
                // Add harmony
                playNote(freq * 0.5, dur * pattern.tempo * 2, 'sine', 0.04, musicGain);
            }
            noteIndex = (noteIndex + 1) % pattern.notes.length;
            musicTimeout = setTimeout(scheduleNext, dur * pattern.tempo * 1000);
        }
        scheduleNext();
    }

    function stopMusic() {
        currentMusicName = null;
        if (musicTimeout) {
            clearTimeout(musicTimeout);
            musicTimeout = null;
        }
    }

    return {
        init, resume, sfx, playMusic, stopMusic,
        get initialized() { return initialized; }
    };
})();
