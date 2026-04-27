import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';

/**
 * Number Rush — responde operaciones matemáticas contra el reloj.
 *
 * Sin Three.js. Solo React + Tailwind.
 *
 * Mecánica:
 *   - Aparece una operación (suma, resta, multiplicación)
 *   - Cuatro opciones de respuesta
 *   - Tienes 5 segundos por pregunta
 *   - Acierto = +10 puntos + bonus por velocidad
 *   - Fallo o tiempo = 0 puntos, se pasa a la siguiente
 *   - 15 preguntas en total
 *
 * Comunicación con Laravel:
 *   Al iniciar  → POST /api/sessions
 *   Al terminar → PATCH /api/sessions/{token}/finish
 */

const TOTAL_QUESTIONS = 15;
const TIME_PER_Q      = 5; // segundos

// Generar una pregunta aleatoria según dificultad
function generateQuestion(level) {
    const ops    = level < 5 ? ['+', '-'] : level < 10 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
    const op     = ops[Math.floor(Math.random() * ops.length)];

    let a, b, answer;

    if (op === '+') {
        a = Math.floor(Math.random() * (10 + level * 3)) + 1;
        b = Math.floor(Math.random() * (10 + level * 3)) + 1;
        answer = a + b;
    } else if (op === '-') {
        a = Math.floor(Math.random() * (20 + level * 3)) + 5;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
    } else if (op === '×') {
        a = Math.floor(Math.random() * (4 + level)) + 2;
        b = Math.floor(Math.random() * (4 + level)) + 2;
        answer = a * b;
    } else {
        b      = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        a      = b * answer;
    }

    // Generar 3 distractores únicos
    const wrong = new Set();
    while (wrong.size < 3) {
        const offset = Math.floor(Math.random() * 10) + 1;
        const w      = Math.random() > 0.5 ? answer + offset : Math.max(1, answer - offset);
        if (w !== answer) wrong.add(w);
    }

    const options = [...wrong, answer].sort(() => Math.random() - 0.5);

    return { question: `${a} ${op} ${b}`, answer, options };
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

export default function NumberRush({ game, apiToken }) {
    const [phase,      setPhase]      = useState('idle');
    const [current,    setCurrent]    = useState(null);     // pregunta actual
    const [qIndex,     setQIndex]     = useState(0);        // número de pregunta
    const [timeLeft,   setTimeLeft]   = useState(TIME_PER_Q);
    const [score,      setScore]      = useState(0);
    const [correct,    setCorrect]    = useState(0);
    const [selected,   setSelected]   = useState(null);     // opción elegida
    const [feedback,   setFeedback]   = useState(null);     // 'correct' | 'wrong' | 'timeout'
    const [bestScore,  setBestScore]  = useState(0);

    const scoreRef  = useRef(0);
    const correctRef = useRef(0);
    const levelRef  = useRef(1);

    const { start: startAPI, end: endAPI } = useGameAPI(apiToken, game?.id);

    // Cargar pregunta
    const loadQuestion = useCallback((index) => {
        const q = generateQuestion(levelRef.current);
        setCurrent(q);
        setQIndex(index);
        setTimeLeft(TIME_PER_Q);
        setSelected(null);
        setFeedback(null);
    }, []);

    // Iniciar partida
    const startGame = useCallback(async () => {
        await startAPI();
        scoreRef.current   = 0;
        correctRef.current = 0;
        levelRef.current   = 1;
        setScore(0);
        setCorrect(0);
        setPhase('playing');
        loadQuestion(0);
    }, [startAPI, loadQuestion]);

    // Pasar a la siguiente pregunta o terminar
    const nextQuestion = useCallback((index) => {
        // Subir nivel cada 5 preguntas
        levelRef.current = 1 + Math.floor(index / 5);

        if (index >= TOTAL_QUESTIONS) {
            setPhase('gameover');
            setBestScore(prev => Math.max(prev, scoreRef.current));
            endAPI(scoreRef.current, {
                correct:   correctRef.current,
                incorrect: TOTAL_QUESTIONS - correctRef.current,
            });
        } else {
            loadQuestion(index);
        }
    }, [loadQuestion, endAPI]);

    // Responder
    const handleAnswer = useCallback((option) => {
        if (phase !== 'playing' || selected !== null) return;

        setSelected(option);
        const isCorrect = option === current.answer;

        if (isCorrect) {
            // Bonus de velocidad: más puntos cuanto más rápido respondas
            const bonus     = Math.ceil(timeLeft / TIME_PER_Q * 5);
            const gained    = 10 + bonus;
            scoreRef.current  += gained;
            correctRef.current++;
            setScore(scoreRef.current);
            setCorrect(correctRef.current);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }

        setTimeout(() => nextQuestion(qIndex + 1), 900);
    }, [phase, selected, current, timeLeft, qIndex, nextQuestion]);

    // Countdown por pregunta
    useEffect(() => {
        if (phase !== 'playing' || selected !== null) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setFeedback('timeout');
                    setTimeout(() => nextQuestion(qIndex + 1), 900);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, qIndex, selected]);

    // Color de cada opción según el estado
    const optionStyle = (option) => {
        if (selected === null) {
            return 'bg-zinc-800 border-zinc-700 hover:border-violet-500 hover:bg-zinc-700';
        }
        if (option === current.answer) {
            return 'bg-emerald-950 border-emerald-600 text-emerald-300';
        }
        if (option === selected && option !== current.answer) {
            return 'bg-red-950 border-red-700 text-red-400';
        }
        return 'bg-zinc-800 border-zinc-700 opacity-40';
    };

    const timePercent = (timeLeft / TIME_PER_Q) * 100;

    return (
        <AppLayout title={game?.title ?? 'Number Rush'}>
            <Head title="Number Rush" />

            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-8 select-none">

                {/* Título */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
                        Number Rush
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Responde operaciones matemáticas contra el reloj
                    </p>
                </div>

                {/* Pantalla idle */}
                {phase === 'idle' && (
                    <div className="text-center flex flex-col items-center gap-5">
                        <p className="text-sm text-zinc-500 max-w-xs">
                            {TOTAL_QUESTIONS} preguntas · {TIME_PER_Q} segundos por pregunta<br/>
                            Responder rápido da puntos extra
                        </p>
                        {bestScore > 0 && (
                            <p className="text-sm text-zinc-600">Récord: <strong className="text-zinc-300">{bestScore}</strong></p>
                        )}
                        <button
                            onClick={startGame}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-900/40"
                        >
                            Empezar
                        </button>
                    </div>
                )}

                {/* Pantalla de juego */}
                {phase === 'playing' && current && (
                    <>
                        {/* Progreso + tiempo */}
                        <div className="w-full max-w-sm flex flex-col gap-2">
                            {/* Progreso de preguntas */}
                            <div className="flex items-center justify-between text-xs text-zinc-600">
                                <span>Pregunta {qIndex + 1} / {TOTAL_QUESTIONS}</span>
                                <span>Puntos: <strong className="text-violet-400">{score}</strong></span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-600 rounded-full transition-all duration-300"
                                    style={{ width: `${((qIndex) / TOTAL_QUESTIONS) * 100}%` }}
                                />
                            </div>

                            {/* Barra de tiempo */}
                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        timePercent > 60 ? 'bg-emerald-500' :
                                        timePercent > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${timePercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Operación */}
                        <div className={`
                            w-full max-w-sm bg-zinc-900 border-2 rounded-2xl p-8 text-center
                            transition-colors duration-200
                            ${feedback === 'correct' ? 'border-emerald-600' :
                              feedback === 'wrong' || feedback === 'timeout' ? 'border-red-700' :
                              'border-zinc-800'}
                        `}>
                            <p className="text-5xl font-extrabold text-zinc-100 tracking-tight">
                                {current.question}
                            </p>
                            {feedback === 'timeout' && (
                                <p className="text-sm text-red-400 mt-3">¡Tiempo!</p>
                            )}
                            {feedback === 'correct' && (
                                <p className="text-sm text-emerald-400 mt-3">✓ ¡Correcto!</p>
                            )}
                            {feedback === 'wrong' && (
                                <p className="text-sm text-red-400 mt-3">
                                    Incorrecto — era <strong>{current.answer}</strong>
                                </p>
                            )}
                        </div>

                        {/* Opciones */}
                        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                            {current.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(option)}
                                    disabled={selected !== null}
                                    className={`
                                        py-4 rounded-xl text-xl font-bold border-2
                                        transition-all duration-150 disabled:cursor-not-allowed
                                        ${optionStyle(option)}
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {/* Indicador de nivel */}
                        <p className="text-xs text-zinc-700">
                            Nivel {levelRef.current} · {correct} aciertos
                        </p>
                    </>
                )}

                {/* Pantalla de resultados */}
                {phase === 'gameover' && (
                    <div className="text-center flex flex-col items-center gap-4">
                        <p className="text-5xl">
                            {correct >= TOTAL_QUESTIONS * 0.8 ? '🧠' :
                             correct >= TOTAL_QUESTIONS * 0.5 ? '👍' : '💪'}
                        </p>
                        <h2 className="text-2xl font-bold text-zinc-100">
                            {correct >= TOTAL_QUESTIONS * 0.8 ? '¡Matemático!' :
                             correct >= TOTAL_QUESTIONS * 0.5 ? '¡Buen intento!' : 'Sigue practicando'}
                        </h2>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            {[
                                { label: 'Puntos',    value: score,                            color: 'text-violet-400' },
                                { label: 'Aciertos',  value: correct,                          color: 'text-emerald-400' },
                                { label: 'Precisión', value: `${Math.round((correct / TOTAL_QUESTIONS) * 100)}%`, color: 'text-cyan-400' },
                            ].map(s => (
                                <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center">
                                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-zinc-600 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {score >= bestScore && score > 0 && (
                            <p className="text-yellow-400 text-sm">🏆 ¡Nuevo récord!</p>
                        )}

                        <div className="flex gap-3 mt-2">
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
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
