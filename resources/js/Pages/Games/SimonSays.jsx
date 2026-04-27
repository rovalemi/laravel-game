import { Head } from '@inertiajs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';

/**
 * Simon Says — juego de memoria de colores.
 *
 * Sin Three.js. Solo React + Tailwind + CSS animations.
 *
 * Mecánica:
 *   1. El tablero muestra una secuencia de colores (uno a uno se iluminan)
 *   2. El jugador repite la secuencia en el mismo orden
 *   3. Cada ronda añade un color más
 *   4. Si te equivocas → Game Over
 *
 * Comunicación con Laravel:
 *   Al iniciar  → POST /api/sessions        { game_id }
 *   Al terminar → PATCH /api/sessions/{token}/finish { score, result_data }
 */

// ── Definición de los 4 colores ──────────────────────────────────────────────
const BUTTONS = [
    {
        id:       'green',
        label:    'Verde',
        base:     'bg-emerald-700 border-emerald-600',
        lit:      'bg-emerald-300 border-emerald-200 shadow-emerald-400/80',
        dot:      'bg-emerald-400',
        freq:     415,
    },
    {
        id:       'red',
        label:    'Rojo',
        base:     'bg-red-700 border-red-600',
        lit:      'bg-red-300 border-red-200 shadow-red-400/80',
        dot:      'bg-red-400',
        freq:     310,
    },
    {
        id:       'yellow',
        label:    'Amarillo',
        base:     'bg-yellow-600 border-yellow-500',
        lit:      'bg-yellow-200 border-yellow-100 shadow-yellow-300/80',
        dot:      'bg-yellow-400',
        freq:     252,
    },
    {
        id:       'blue',
        label:    'Azul',
        base:     'bg-blue-700 border-blue-600',
        lit:      'bg-blue-300 border-blue-200 shadow-blue-400/80',
        dot:      'bg-blue-400',
        freq:     209,
    },
];

// ── Fases del juego ──────────────────────────────────────────────────────────
const PHASE = {
    IDLE:     'idle',
    SHOWING:  'showing',
    INPUT:    'input',
    WIN:      'win',
    GAMEOVER: 'gameover',
};

// ── Velocidad según nivel ────────────────────────────────────────────────────
function getSpeed(level) {
    if (level < 5)  return 700;
    if (level < 10) return 550;
    if (level < 15) return 420;
    return 320;
}

// ── Tono de audio con WebAudio API ───────────────────────────────────────────
function playTone(freq, ms = 280) {
    try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
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
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
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

// ── Hook API Laravel ─────────────────────────────────────────────────────────
function useGameAPI(apiToken, gameId) {
    const tokenRef = useRef(null);

    const start = useCallback(async () => {
        if (!apiToken || !gameId) return;
        try {
            const res = await fetch('/api/sessions', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:  `Bearer ${apiToken}`,
                },
                body: JSON.stringify({ game_id: gameId }),
            });
            if (res.ok) {
                const data    = await res.json();
                tokenRef.current = data.session_token;
            }
        } catch (_) {}
    }, [apiToken, gameId]);

    const end = useCallback(async (score, extra = {}) => {
        if (!tokenRef.current) return;
        try {
            await fetch(`/api/sessions/${tokenRef.current}/finish`, {
                method:  'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:  `Bearer ${apiToken}`,
                },
                body: JSON.stringify({ score, result_data: extra }),
            });
        } catch (_) {}
        tokenRef.current = null;
    }, [apiToken]);

    return { start, end };
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SimonSays({ game, apiToken }) {
    const [phase,      setPhase]      = useState(PHASE.IDLE);
    const [sequence,   setSequence]   = useState([]);
    const [lit,        setLit]        = useState(null);       // id del botón iluminado ahora
    const [inputPos,   setInputPos]   = useState(0);          // posición del jugador en la secuencia
    const [level,      setLevel]      = useState(0);
    const [bestLevel,  setBestLevel]  = useState(0);

    const { start: startAPI, end: endAPI } = useGameAPI(apiToken, game?.id);

    // ── Iluminar un botón con sonido ─────────────────────────────────────────
    const flash = useCallback((colorId, ms) => {
        const btn = BUTTONS.find(b => b.id === colorId);
        return new Promise(resolve => {
            setLit(colorId);
            if (btn) playTone(btn.freq, ms * 0.8);
            setTimeout(() => {
                setLit(null);
                setTimeout(resolve, 60); // pausa entre destellos
            }, ms);
        });
    }, []);

    // ── Reproducir la secuencia completa ────────────────────────────────────
    const playSequence = useCallback(async (seq) => {
        setPhase(PHASE.SHOWING);
        setInputPos(0);

        // Pausa inicial antes de empezar
        await new Promise(r => setTimeout(r, 500));

        const speed = getSpeed(seq.length);
        for (const colorId of seq) {
            await flash(colorId, speed);
        }

        setPhase(PHASE.INPUT);
    }, [flash]);

    // ── Iniciar nueva partida ────────────────────────────────────────────────
    const startGame = useCallback(async () => {
        await startAPI();

        const first = BUTTONS[Math.floor(Math.random() * BUTTONS.length)].id;
        const seq   = [first];

        setSequence(seq);
        setLevel(1);
        setInputPos(0);

        await playSequence(seq);
    }, [startAPI, playSequence]);

    // ── Click del jugador en un botón ────────────────────────────────────────
    const handlePress = useCallback(async (colorId) => {
        if (phase !== PHASE.INPUT) return;

        const btn      = BUTTONS.find(b => b.id === colorId);
        const expected = sequence[inputPos];

        // Feedback visual breve
        setLit(colorId);
        if (btn) playTone(btn.freq, 180);
        setTimeout(() => setLit(null), 180);

        // ── Error ────────────────────────────────────────────────────────────
        if (colorId !== expected) {
            playError();
            setPhase(PHASE.GAMEOVER);
            setBestLevel(prev => Math.max(prev, level - 1));
            await endAPI(level - 1, { sequence_length: sequence.length });
            return;
        }

        const nextPos = inputPos + 1;

        // ── Ronda completada correctamente ───────────────────────────────────
        if (nextPos === sequence.length) {
            setPhase(PHASE.WIN);

            const nextLevel = level + 1;
            setLevel(nextLevel);

            const nextColor = BUTTONS[Math.floor(Math.random() * BUTTONS.length)].id;
            const nextSeq   = [...sequence, nextColor];
            setSequence(nextSeq);

            // Pequeña pausa de celebración antes de la siguiente ronda
            await new Promise(r => setTimeout(r, 600));
            await playSequence(nextSeq);

        } else {
            // ── Siguiente paso en la misma ronda ─────────────────────────────
            setInputPos(nextPos);
        }
    }, [phase, sequence, inputPos, level, flash, endAPI, playSequence]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AppLayout title={game?.title ?? 'Simon Says'}>
            <Head title="Simon Says" />

            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-8 select-none">

                {/* Título */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
                        Simon Says
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Repite la secuencia de colores en el mismo orden
                    </p>
                </div>

                {/* Marcadores */}
                <div className="flex gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-4 text-center">
                        <p className="text-3xl font-extrabold text-violet-400 leading-none">
                            {level}
                        </p>
                        <p className="text-xs text-zinc-600 mt-1 uppercase tracking-widest">
                            Nivel
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-4 text-center">
                        <p className="text-3xl font-extrabold text-zinc-500 leading-none">
                            {bestLevel}
                        </p>
                        <p className="text-xs text-zinc-600 mt-1 uppercase tracking-widest">
                            Récord
                        </p>
                    </div>
                </div>

                {/* Tablero 2×2 */}
                <div className="relative">
                    <div className="grid grid-cols-2 gap-4 w-72 h-72 sm:w-80 sm:h-80">
                        {BUTTONS.map(btn => {
                            const isLit = lit === btn.id;
                            return (
                                <button
                                    key={btn.id}
                                    onClick={() => handlePress(btn.id)}
                                    disabled={phase !== PHASE.INPUT}
                                    aria-label={btn.label}
                                    className={`
                                        rounded-2xl border-2 transition-all duration-100
                                        disabled:cursor-not-allowed
                                        ${isLit
                                            ? `${btn.lit} shadow-2xl scale-95`
                                            : `${btn.base} hover:brightness-125 active:scale-95`
                                        }
                                    `}
                                />
                            );
                        })}
                    </div>

                    {/* Círculo central decorativo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center z-10">
                            {phase === PHASE.SHOWING && (
                                <span className="text-zinc-600 text-xs animate-pulse">👁</span>
                            )}
                            {phase === PHASE.INPUT && (
                                <span className="text-violet-400 text-xs">▶</span>
                            )}
                            {phase === PHASE.WIN && (
                                <span className="text-emerald-400">✓</span>
                            )}
                            {phase === PHASE.GAMEOVER && (
                                <span className="text-red-400">✕</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barra de progreso de la secuencia */}
                {(phase === PHASE.INPUT || phase === PHASE.SHOWING) && sequence.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                        {sequence.map((colorId, i) => {
                            const btn = BUTTONS.find(b => b.id === colorId);
                            return (
                                <div
                                    key={i}
                                    className={`
                                        w-2.5 h-2.5 rounded-full transition-all duration-150
                                        ${i < inputPos
                                            ? btn?.dot ?? 'bg-zinc-500'
                                            : i === inputPos && phase === PHASE.INPUT
                                                ? 'bg-zinc-400 ring-2 ring-white/30'
                                                : 'bg-zinc-800'
                                        }
                                    `}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Mensajes de estado */}
                <div className="h-24 flex flex-col items-center justify-center text-center">

                    {phase === PHASE.IDLE && (
                        <>
                            <p className="text-sm text-zinc-500 mb-5">
                                Observa la secuencia de colores y repítela.
                                <br />
                                Cada ronda añade un color más.
                            </p>
                            <button
                                onClick={startGame}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-900/40"
                            >
                                Empezar a jugar
                            </button>
                        </>
                    )}

                    {phase === PHASE.SHOWING && (
                        <p className="text-sm text-zinc-400 animate-pulse">
                            Observa la secuencia…
                        </p>
                    )}

                    {phase === PHASE.INPUT && (
                        <p className="text-sm text-violet-400">
                            Tu turno —{' '}
                            <span className="font-semibold">
                                {sequence.length - inputPos}
                            </span>
                            {' '}paso{sequence.length - inputPos !== 1 ? 's' : ''} restante{sequence.length - inputPos !== 1 ? 's' : ''}
                        </p>
                    )}

                    {phase === PHASE.WIN && (
                        <p className="text-sm text-emerald-400 font-semibold">
                            ✓ ¡Correcto! Siguiente ronda…
                        </p>
                    )}

                    {phase === PHASE.GAMEOVER && (
                        <>
                            <p className="text-red-400 font-bold text-lg mb-1">
                                ¡Incorrecto!
                            </p>
                            <p className="text-sm text-zinc-500 mb-4">
                                Llegaste al nivel{' '}
                                <strong className="text-zinc-200">{level - 1}</strong>
                                {level - 1 >= bestLevel && level - 1 > 0 && (
                                    <span className="text-yellow-400 ml-2">🏆 ¡Nuevo récord!</span>
                                )}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={startGame}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
                                >
                                    Jugar de nuevo
                                </button>
                                <a
                                    href={route('player.games.index')}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                                >
                                    Volver
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
