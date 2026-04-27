import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';

/**
 * Whack-a-Mole — golpea los topos antes de que se escondan.
 *
 * Sin Three.js. Solo React + Tailwind + CSS animations.
 *
 * Mecánica:
 *   - Cuadrícula de 9 agujeros (3×3)
 *   - Los topos aparecen aleatoriamente durante 30 segundos
 *   - Click en un topo = +1 punto (topo normal) o +3 (topo dorado)
 *   - Click en un topo bomba = −2 puntos
 *   - La velocidad aumenta con el tiempo
 *
 * Comunicación con Laravel:
 *   Al iniciar  → POST /api/sessions
 *   Al terminar → PATCH /api/sessions/{token}/finish
 */

const GAME_DURATION = 30; // segundos

// Tipos de topo
const MOLE_TYPES = {
    normal: { emoji: '🐭', points: 1,  chance: 0.70, color: 'bg-amber-800'   },
    golden: { emoji: '⭐', points: 3,  chance: 0.15, color: 'bg-yellow-600'  },
    bomb:   { emoji: '💣', points: -2, chance: 0.15, color: 'bg-zinc-700'    },
};

function getMoleType() {
    const r = Math.random();
    if (r < MOLE_TYPES.normal.chance) return 'normal';
    if (r < MOLE_TYPES.normal.chance + MOLE_TYPES.golden.chance) return 'golden';
    return 'bomb';
}

// Hook API Laravel
function useGameAPI(apiToken, gameId) {
    const tokenRef = useRef(null);

    const start = useCallback(async () => {
        if (!apiToken || !gameId) return;
        try {
            const res = await fetch('/api/sessions', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
                body:    JSON.stringify({ game_id: gameId }),
            });
            if (res.ok) tokenRef.current = (await res.json()).session_token;
        } catch (_) {}
    }, [apiToken, gameId]);

    const end = useCallback(async (score, extra = {}) => {
        if (!tokenRef.current) return;
        try {
            await fetch(`/api/sessions/${tokenRef.current}/finish`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
                body:    JSON.stringify({ score, result_data: extra }),
            });
        } catch (_) {}
        tokenRef.current = null;
    }, [apiToken]);

    return { start, end };
}

// Componente de un agujero
function Hole({ mole, onClick }) {
    const type = mole ? MOLE_TYPES[mole.type] : null;

    return (
        <div
            className="relative aspect-square rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden cursor-pointer"
            onClick={onClick}
        >
            {/* Fondo del agujero */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-900" />

            {/* Topo */}
            {mole && (
                <div
                    className={`
                        absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-1
                        transition-transform duration-150
                        ${mole.visible ? 'translate-y-0' : 'translate-y-full'}
                    `}
                >
                    <div className={`
                        w-[75%] aspect-square rounded-full flex items-center justify-center
                        text-2xl sm:text-3xl shadow-xl
                        ${type?.color ?? 'bg-amber-800'}
                        ${mole.hit ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}
                        transition-all duration-100
                    `}>
                        {mole.hit ? '💥' : type?.emoji}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WhackAMole({ game, apiToken }) {
    // holes: array de 9 posiciones, cada una null o { type, visible, hit }
    const [holes,     setHoles]     = useState(Array(9).fill(null));
    const [phase,     setPhase]     = useState('idle');
    const [score,     setScore]     = useState(0);
    const [timeLeft,  setTimeLeft]  = useState(GAME_DURATION);
    const [hits,      setHits]      = useState(0);
    const [misses,    setMisses]    = useState(0);
    const [bestScore, setBestScore] = useState(0);

    const scoreRef    = useRef(0);
    const hitsRef     = useRef(0);
    const missesRef   = useRef(0);
    const timersRef   = useRef([]);  // timeouts activos para limpiar en unmount

    const { start: startAPI, end: endAPI } = useGameAPI(apiToken, game?.id);

    // Limpiar todos los timers
    const clearAllTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    // Hacer aparecer un topo en un agujero libre
    const spawnMole = useCallback((currentScore) => {
        setHoles(prev => {
            const freeIndexes = prev.reduce((acc, h, i) => {
                if (!h) acc.push(i);
                return acc;
            }, []);

            if (freeIndexes.length === 0) return prev;

            const idx    = freeIndexes[Math.floor(Math.random() * freeIndexes.length)];
            const type   = getMoleType();
            const speed  = Math.max(600, 1400 - currentScore * 30); // más rápido con más puntos

            const next   = [...prev];
            next[idx]    = { type, visible: true, hit: false };

            // Esconder el topo después de `speed` ms si no lo golpearon
            const hideTimer = setTimeout(() => {
                setHoles(h => {
                    const updated = [...h];
                    if (updated[idx] && !updated[idx].hit) {
                        // No lo golpearon → miss
                        missesRef.current++;
                        setMisses(missesRef.current);
                        updated[idx] = null;
                    }
                    return updated;
                });
            }, speed);

            timersRef.current.push(hideTimer);
            return next;
        });
    }, []);

    // Iniciar partida
    const startGame = useCallback(async () => {
        clearAllTimers();
        await startAPI();

        scoreRef.current  = 0;
        hitsRef.current   = 0;
        missesRef.current = 0;

        setScore(0);
        setHits(0);
        setMisses(0);
        setTimeLeft(GAME_DURATION);
        setHoles(Array(9).fill(null));
        setPhase('playing');
    }, [clearAllTimers, startAPI]);

    // Loop del juego: spawn + countdown
    useEffect(() => {
        if (phase !== 'playing') return;

        // Spawn periódico de topos
        let spawnInterval;
        const scheduleSpawn = () => {
            const delay = Math.max(400, 900 - scoreRef.current * 15);
            spawnInterval = setTimeout(() => {
                spawnMole(scoreRef.current);
                scheduleSpawn();
            }, delay);
            timersRef.current.push(spawnInterval);
        };
        scheduleSpawn();

        // Spawnear uno inmediatamente
        spawnMole(scoreRef.current);

        // Countdown
        const countdownInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    clearAllTimers();
                    setHoles(Array(9).fill(null));
                    setPhase('gameover');
                    setBestScore(b => Math.max(b, scoreRef.current));
                    endAPI(scoreRef.current, {
                        hits:   hitsRef.current,
                        misses: missesRef.current,
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
            clearAllTimers();
        };
    }, [phase]);

    // Golpear un topo
    const handleHit = useCallback((index) => {
        if (phase !== 'playing') return;

        setHoles(prev => {
            const mole = prev[index];
            if (!mole || mole.hit) return prev; // ya golpeado o vacío

            const type   = MOLE_TYPES[mole.type];
            const points = type.points;

            scoreRef.current = Math.max(0, scoreRef.current + points);
            setScore(scoreRef.current);

            if (points > 0) {
                hitsRef.current++;
                setHits(hitsRef.current);
            }

            const next   = [...prev];
            next[index]  = { ...mole, hit: true };

            // Quitar el topo golpeado tras la animación
            const t = setTimeout(() => {
                setHoles(h => {
                    const u = [...h];
                    u[index] = null;
                    return u;
                });
            }, 250);
            timersRef.current.push(t);

            return next;
        });
    }, [phase]);

    // Limpiar al desmontar
    useEffect(() => {
        return () => clearAllTimers();
    }, [clearAllTimers]);

    // Porcentaje de tiempo restante para la barra
    const timePercent = (timeLeft / GAME_DURATION) * 100;

    return (
        <AppLayout title={game?.title ?? 'Whack-a-Mole'}>
            <Head title="Whack-a-Mole" />

            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-6 select-none">

                {/* Título */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
                        Whack-a-Mole
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Golpea los topos antes de que se escondan
                    </p>
                </div>

                {/* HUD */}
                <div className="flex items-center gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-3 text-center">
                        <p className="text-2xl font-extrabold text-violet-400 leading-none">{score}</p>
                        <p className="text-xs text-zinc-600 mt-0.5 uppercase tracking-widest">Puntos</p>
                    </div>

                    {/* Barra de tiempo */}
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-zinc-500">
                            <span className={timeLeft <= 10 ? 'text-red-400 font-bold' : ''}>{timeLeft}s</span>
                        </p>
                        <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                    timePercent > 50 ? 'bg-emerald-500' :
                                    timePercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${timePercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-3 text-center">
                        <p className="text-2xl font-extrabold text-zinc-500 leading-none">{bestScore}</p>
                        <p className="text-xs text-zinc-600 mt-0.5 uppercase tracking-widest">Récord</p>
                    </div>
                </div>

                {/* Cuadrícula 3×3 */}
                <div className="grid grid-cols-3 gap-4 w-72 sm:w-80">
                    {holes.map((mole, i) => (
                        <Hole key={i} mole={mole} onClick={() => handleHit(i)} />
                    ))}
                </div>

                {/* Leyenda */}
                {phase === 'playing' && (
                    <div className="flex gap-4 text-xs text-zinc-600">
                        <span>🐭 +1</span>
                        <span>⭐ +3</span>
                        <span>💣 −2</span>
                    </div>
                )}

                {/* Estado */}
                <div className="h-20 flex flex-col items-center justify-center text-center">

                    {phase === 'idle' && (
                        <>
                            <p className="text-sm text-zinc-500 mb-5">
                                Tienes {GAME_DURATION} segundos.<br />
                                ⭐ Dorado = +3 · 💣 Bomba = −2
                            </p>
                            <button
                                onClick={startGame}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-900/40"
                            >
                                Empezar
                            </button>
                        </>
                    )}

                    {phase === 'gameover' && (
                        <>
                            <p className="text-lg font-bold text-zinc-100 mb-1">
                                ¡Tiempo!
                            </p>
                            <p className="text-sm text-zinc-500 mb-1">
                                Puntuación: <strong className="text-white">{score}</strong>
                                {' · '}{hits} aciertos · {misses} fallados
                            </p>
                            {score >= bestScore && score > 0 && (
                                <p className="text-yellow-400 text-sm mb-3">🏆 ¡Nuevo récord!</p>
                            )}
                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={startGame}
                                    className="px-6 py-2 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
                                >
                                    Jugar de nuevo
                                </button>
                                <a
                                    href={route('player.games.index')}
                                    className="px-6 py-2 rounded-xl font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
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
