import { useState, useCallback } from 'react';

/**
 * Simon Says — juego clásico de memoria y secuencias.
 *
 * Mecánica: cuatro botones de colores se iluminan en un orden creciente.
 * El jugador debe repetir la secuencia exacta pulsando los botones en el mismo orden.
 * Cada ronda añade un nuevo color, aumentando la dificultad progresivamente.
 *
 * Incluye efectos de sonido generados por WebAudio API y animaciones visuales
 * para reforzar cada pulsación y cada paso de la secuencia.
 */

const BUTTONS = [
    { id: 'green',  base: 'bg-emerald-700 border-emerald-600', lit: 'bg-emerald-300 border-emerald-200 shadow-emerald-400/80', freq: 415 },
    { id: 'red',    base: 'bg-red-700 border-red-600',         lit: 'bg-red-300 border-red-200 shadow-red-400/80',         freq: 310 },
    { id: 'yellow', base: 'bg-yellow-600 border-yellow-500',   lit: 'bg-yellow-200 border-yellow-100 shadow-yellow-300/80', freq: 252 },
    { id: 'blue',   base: 'bg-blue-700 border-blue-600',       lit: 'bg-blue-300 border-blue-200 shadow-blue-400/80',       freq: 209 },
];

const PHASE = {
    IDLE: 'idle',
    SHOWING: 'showing',
    INPUT: 'input',
    WIN: 'win',
    GAMEOVER: 'gameover',
};

function getSpeed(level) {
    if (level < 5) return 700;
    if (level < 10) return 550;
    if (level < 15) return 420;
    return 320;
}

function playTone(freq, ms = 280) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
        osc.start();
        osc.stop(ctx.currentTime + ms / 1000);
    } catch (_) {}
}

function playError() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.value = 80;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    } catch (_) {}
}

export default function SimonSays({ game, apiToken, startAPI, endAPI }) {
    const [phase, setPhase] = useState(PHASE.IDLE);
    const [sequence, setSequence] = useState([]);
    const [lit, setLit] = useState(null);
    const [inputPos, setInputPos] = useState(0);
    const [level, setLevel] = useState(1);
    const [bestLevel, setBestLevel] = useState(0);

    const flash = useCallback((colorId, ms) => {
        const btn = BUTTONS.find(b => b.id === colorId);
        return new Promise(resolve => {
            setLit(colorId);
            if (btn) playTone(btn.freq, ms * 0.8);
            setTimeout(() => {
                setLit(null);
                setTimeout(resolve, 60);
            }, ms);
        });
    }, []);

    const playSequence = useCallback(async (seq) => {
        setPhase(PHASE.SHOWING);
        setInputPos(0);

        await new Promise(r => setTimeout(r, 500));

        const speed = getSpeed(seq.length);
        for (const colorId of seq) {
            await flash(colorId, speed);
        }

        setPhase(PHASE.INPUT);
    }, [flash]);

    const startGame = useCallback(async () => {
        if (startAPI) await startAPI();

        const first = BUTTONS[Math.floor(Math.random() * BUTTONS.length)].id;
        const seq = [first];

        setSequence(seq);
        setLevel(1);
        setInputPos(0);

        await playSequence(seq);
    }, [startAPI, playSequence]);

    const handlePress = useCallback(async (colorId) => {
        if (phase !== PHASE.INPUT) return;

        const expected = sequence[inputPos];

        setLit(colorId);
        const btn = BUTTONS.find(b => b.id === colorId);
        if (btn) playTone(btn.freq, 180);
        setTimeout(() => setLit(null), 180);

        if (colorId !== expected) {
            playError();
            setPhase(PHASE.GAMEOVER);
            setBestLevel(prev => Math.max(prev, level));
            await endAPI(level, { sequence_length: sequence.length });
            return;
        }

        const nextPos = inputPos + 1;

        if (nextPos === sequence.length) {
            setPhase(PHASE.WIN);

            const nextLevel = level + 1;
            setLevel(nextLevel);

            const nextColor = BUTTONS[Math.floor(Math.random() * BUTTONS.length)].id;
            const nextSeq = [...sequence, nextColor];
            setSequence(nextSeq);

            await new Promise(r => setTimeout(r, 600));
            await playSequence(nextSeq);

        } else {
            setInputPos(nextPos);
        }
    }, [phase, sequence, inputPos, level, endAPI, playSequence]);

    const phaseLabel = {
        idle: '',
        showing: 'Observa la secuencia…',
        input: `Tu turno — ${sequence.length - inputPos} paso${sequence.length - inputPos !== 1 ? 's' : ''} restante${sequence.length - inputPos !== 1 ? 's' : ''}`,
        win: '✓ ¡Correcto!',
        gameover: '',
    }[phase] ?? '';

    return (
        <div className="flex flex-col w-full h-full gap-3 select-none">

            {/* HUD */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
                <div className="flex items-center gap-6 text-sm">
                    <span className="text-zinc-500">
                        Nivel <strong className="text-violet-400 text-lg ml-1">{level}</strong>
                    </span>
                    <span className="text-zinc-500">
                        Récord <strong className="text-zinc-300 ml-1">{bestLevel}</strong>
                    </span>
                </div>

                {phaseLabel && (
                    <span className={`text-xs px-3 py-1 rounded-full ${
                        phase === PHASE.INPUT
                            ? 'bg-violet-900 text-violet-300'
                            : phase === PHASE.WIN
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-zinc-800 text-zinc-400'
                    }`}>
                        {phaseLabel}
                    </span>
                )}
            </div>

            {/* TABLERO */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-[#060610] border border-zinc-800 flex items-center justify-center relative">
                <div className="grid grid-cols-2 gap-4 w-72 h-72 sm:w-80 sm:h-80">
                    {BUTTONS.map(btn => {
                        const isLit = lit === btn.id;
                        return (
                            <button
                                key={btn.id}
                                onClick={() => handlePress(btn.id)}
                                disabled={phase !== PHASE.INPUT}
                                className={`
                                    rounded-2xl border-2 transition-all duration-100
                                    ${isLit ? btn.lit : btn.base}
                                `}
                            />
                        );
                    })}
                </div>

                {/* Pantalla inicio */}
                {phase === PHASE.IDLE && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 rounded-2xl">
                        <p className="text-5xl mb-4">🎯</p>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Simon Says</h2>
                        <p className="text-sm text-zinc-400 mb-8 text-center max-w-xs">
                            Observa la secuencia de colores y repítela en el mismo orden.
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
                        >
                            Empezar
                        </button>
                    </div>
                )}

                {/* OVERLAY: GAME OVER */}
                {phase === PHASE.GAMEOVER && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-2xl">
                        <h2 className="text-2xl font-bold text-red-400 mb-2">¡Incorrecto!</h2>
                        <p className="text-zinc-400 mb-1">
                            Llegaste al nivel <strong className="text-white">{level - 1}</strong>
                        </p>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={startGame}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
                            >
                                Jugar de nuevo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Progreso (espacio reservado siempre) */}
            <div className="h-6 flex items-center justify-center shrink-0">
                {(phase === PHASE.SHOWING || phase === PHASE.INPUT) ? (
                    <div className="flex gap-1.5">
                        {sequence.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i < inputPos
                                        ? 'bg-violet-500'
                                        : i === inputPos && phase === PHASE.INPUT
                                            ? 'bg-zinc-500 ring-2 ring-violet-500'
                                            : 'bg-zinc-800'
                                }`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-2" />
                )}
            </div>
        </div>
    );
}
