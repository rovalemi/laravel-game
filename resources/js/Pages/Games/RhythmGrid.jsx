import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Rhythm Grid — juego de ritmo con cuadrícula 3D en Three.js.
 *
 * Mecánica: varias celdas de una cuadrícula 3D se iluminan siguiendo un BPM fijo.
 * El jugador debe clickar las celdas activas en el momento exacto para sumar puntos.
 * Los aciertos consecutivos aumentan el combo y multiplican la puntuación.
 *
 * Utiliza Three.js para la cuadrícula 3D y WebAudio API para generar tonos
 * sincronizados con cada beat, creando una experiencia rítmica reactiva.
 */

function useGameAPI(apiToken, gameId) {
    const sessionRef = useRef(null);

    const start = useCallback(async () => {
        if (!apiToken || !gameId) return;
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
                body: JSON.stringify({ game_id: gameId }),
            });
            if (res.ok) sessionRef.current = (await res.json()).session_token;
        } catch (_) {}
    }, [apiToken, gameId]);

    const end = useCallback(async (score, extra = {}) => {
        if (!sessionRef.current) return;
        try {
            await fetch(`/api/sessions/${sessionRef.current}/finish`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
                body: JSON.stringify({ score, result_data: extra }),
            });
        } catch (_) {}
        sessionRef.current = null;
    }, [apiToken]);

    return { start, end };
}

// Audio procedural
function playNote(freq = 440, duration = 0.1, type = 'sine') {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (_) {}
}

const COL_NOTES = [261, 294, 329, 349, 392, 440, 494, 523];

const GRID_COLS = 8;
const GRID_ROWS = 4;
const CELL_SIZE = 0.55;
const GAP = 0.12;
const BPM = 120;
const BEAT_MS = (60 / BPM) * 1000;

export default function RhythmGrid({ game, apiToken }) {
    const mountRef = useRef(null);
    const threeRef = useRef({});
    const gameStateRef = useRef({ running: false, score: 0, combo: 0, misses: 0, beat: 0 });

    const [phase, setPhase] = useState('idle');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [beat, setBeat] = useState(0);
    const [totalBeats] = useState(32);

    const { start: startAPI, end: endAPI } = useGameAPI(apiToken, game?.id);

    // ───────────────────────────────────────────────────────────────
    // THREE.JS ENGINE
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        let THREE, renderer, scene, camera, animId;
        const cells = [];
        const activeCells = new Set();

        const W = mountRef.current?.clientWidth ?? 700;
        const H = mountRef.current?.clientHeight ?? 400;

        const gs = gameStateRef.current;

        async function init() {
            THREE = (await import('three')).default ?? await import('three');

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x060610); // Igual que MemoryPulse

            camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
            camera.position.set(0, 3.5, 7);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current?.appendChild(renderer.domElement);

            // Luces
            scene.add(new THREE.AmbientLight(0x112233, 4));
            const dLight = new THREE.DirectionalLight(0x8899ff, 3);
            dLight.position.set(0, 10, 5);
            scene.add(dLight);

            // Piso
            const floorGeo = new THREE.PlaneGeometry(
                GRID_COLS * (CELL_SIZE + GAP) + GAP,
                GRID_ROWS * (CELL_SIZE + GAP) + GAP
            );
            const floorMat = new THREE.MeshPhongMaterial({ color: 0x0a0a18 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            scene.add(floor);

            // Celdas
            const totalW = GRID_COLS * (CELL_SIZE + GAP) - GAP;
            const totalD = GRID_ROWS * (CELL_SIZE + GAP) - GAP;
            const startX = -totalW / 2 + CELL_SIZE / 2;
            const startZ = -totalD / 2 + CELL_SIZE / 2;

            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLS; col++) {
                    const geo = new THREE.BoxGeometry(CELL_SIZE, 0.08, CELL_SIZE);
                    const mat = new THREE.MeshPhongMaterial({
                        color: 0x1a1a2e,
                        emissive: new THREE.Color(0x7c3aed),
                        emissiveIntensity: 0,
                    });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(
                        startX + col * (CELL_SIZE + GAP),
                        0.04,
                        startZ + row * (CELL_SIZE + GAP)
                    );
                    mesh.userData = { row, col, index: row * GRID_COLS + col };
                    scene.add(mesh);
                    cells.push(mesh);
                }
            }

            threeRef.current = { scene, camera, renderer, cells, activeCells };

            // Raycaster
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            const onClick = (e) => {
                if (!gs.running) return;
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const hits = raycaster.intersectObjects(cells);
                if (hits.length > 0) {
                    const { index, col } = hits[0].object.userData;
                    if (activeCells.has(index)) {
                        gs.combo++;
                        gs.score += 10 * Math.min(gs.combo, 5);
                        setScore(gs.score);
                        setCombo(gs.combo);
                        playNote(COL_NOTES[col], 0.15, 'triangle');

                        hits[0].object.material.emissive.setHex(0x10b981);
                        hits[0].object.material.emissiveIntensity = 1.5;
                        activeCells.delete(index);
                        setTimeout(() => {
                            hits[0].object.material.emissive.setHex(0x7c3aed);
                            hits[0].object.material.emissiveIntensity = 0;
                        }, 200);
                    } else {
                        gs.combo = 0;
                        setCombo(0);
                        playNote(80, 0.1, 'sawtooth');
                    }
                }
            };
            renderer.domElement.addEventListener('click', onClick);

            // Loop
            let lastBeat = performance.now();
            let beatCount = 0;

            function scheduleNextBeat(now) {
                if (!gs.running) return;
                const elapsed = now - lastBeat;
                if (elapsed >= BEAT_MS) {
                    lastBeat = now;
                    beatCount++;
                    gs.beat = beatCount;
                    setBeat(beatCount);

                    // Misses
                    for (const idx of activeCells) {
                        cells[idx].material.emissiveIntensity = 0;
                        gs.misses++;
                        gs.combo = 0;
                        setCombo(0);
                    }
                    activeCells.clear();

                    // Nuevas celdas
                    if (beatCount <= totalBeats) {
                        const numCells = 1 + Math.floor(Math.random() * (beatCount > 16 ? 3 : 2));
                        const usedCols = new Set();

                        for (let n = 0; n < numCells; n++) {
                            let col;
                            do { col = Math.floor(Math.random() * GRID_COLS); } while (usedCols.has(col));
                            usedCols.add(col);

                            const row = Math.floor(Math.random() * GRID_ROWS);
                            const idx = row * GRID_COLS + col;

                            cells[idx].material.emissive.setHex(0x7c3aed);
                            cells[idx].material.emissiveIntensity = 1.2;
                            activeCells.add(idx);
                        }

                        playNote(120, 0.05, 'square');
                    } else {
                        gs.running = false;
                        setPhase('gameover');
                        endAPI(gs.score, { misses: gs.misses, max_combo: gs.combo });
                    }
                }
            }

            function animate(now) {
                animId = requestAnimationFrame(animate);
                if (gs.running) scheduleNextBeat(now);

                const pulse = 0.6 + Math.sin(now * 0.008) * 0.4;
                for (const idx of activeCells) {
                    if (cells[idx]) cells[idx].material.emissiveIntensity = pulse;
                }

                renderer.render(scene, camera);
            }
            animate(performance.now());
        }

        init();

        return () => {
            gs.running = false;
            cancelAnimationFrame(animId);
            if (renderer) renderer.dispose();
        };
    }, []);

    // ───────────────────────────────────────────────────────────────
    // START GAME
    // ───────────────────────────────────────────────────────────────
    const startGame = useCallback(async () => {
        await startAPI();
        const gs = gameStateRef.current;
        gs.running = true;
        gs.score = 0;
        gs.combo = 0;
        gs.misses = 0;
        gs.beat = 0;
        setScore(0);
        setCombo(0);
        setBeat(0);
        setPhase('playing');
    }, [startAPI]);

    const progress = Math.min((beat / totalBeats) * 100, 100);

    // ───────────────────────────────────────────────────────────────
    // RENDER
    // ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col w-full h-full gap-3 select-none">

            {/* HUD */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
                <div className="flex items-center gap-6 text-sm">
                    <span className="text-zinc-500">
                        Puntos <strong className="text-violet-400 text-lg ml-1">{score}</strong>
                    </span>
                    <span className={`text-zinc-500 ${combo >= 3 ? 'text-yellow-400' : ''}`}>
                        Combo <strong className="ml-1">{combo}x</strong>
                    </span>
                </div>

                {/* Progreso canción */}
                <div className="flex items-center gap-2 text-xs text-zinc-600 w-40">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-violet-600 transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* CANVAS */}
            <div
                ref={mountRef}
                className="flex-1 rounded-2xl overflow-hidden bg-[#060610] border border-zinc-800 relative"
            >

                {/* Overlay inicio */}
                {phase === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 rounded-2xl">
                        <p className="text-5xl mb-4">🎵</p>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Rhythm Grid</h2>
                        <p className="text-sm text-zinc-400 mb-8 text-center max-w-xs">
                            Toca las celdas que se iluminan al ritmo.<br />
                            Cada acierto en cadena multiplica tu puntuación.
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
                        >
                            Empezar
                        </button>
                    </div>
                )}

                {/* Overlay game over */}
                {phase === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-2xl">
                        <p className="text-5xl mb-4">🎶</p>
                        <h2 className="text-2xl font-bold text-emerald-400 mb-2">¡Canción completada!</h2>
                        <p className="text-zinc-400 mb-1">
                            Puntuación final:{' '}
                            <strong className="text-white text-xl">{score}</strong>
                        </p>
                        <div className="flex gap-3 mt-6">
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

            {/* Pie de ayuda */}
            <div className="h-6 flex items-center justify-center text-xs text-zinc-700 shrink-0">
                {phase === 'playing' ? (
                    <span>Haz clic en las celdas moradas · Combos multiplican tu puntuación</span>
                ) : (
                    <span className="opacity-0">placeholder</span>
                )}
            </div>
        </div>
    );
}
