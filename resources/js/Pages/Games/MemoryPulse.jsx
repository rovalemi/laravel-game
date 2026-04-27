import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';

/**
 * Memory Pulse — juego de memoria con esferas 3D en Three.js.
 *
 * Mecánica: aparecen N esferas en una esfera mayor. Una a una se iluminan
 * en secuencia. El jugador debe repetir la secuencia clickando las esferas
 * en el mismo orden. Cada ronda añade un elemento más.
 *
 * Similar al visual-memory-game pero en 3D.
 */

function useGameAPI(apiToken, gameId) {
    const sessionRef = useRef(null);

    const start = useCallback(async () => {
        if (!apiToken || !gameId) return;
        try {
            const res = await fetch('/api/sessions', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
                body:    JSON.stringify({ game_id: gameId }),
            });
            if (res.ok) sessionRef.current = (await res.json()).session_token;
        } catch (_) {}
    }, [apiToken, gameId]);

    const end = useCallback(async (score, extra = {}) => {
        if (!sessionRef.current) return;
        try {
            await fetch(`/api/sessions/${sessionRef.current}/finish`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
                body:    JSON.stringify({ score, result_data: extra }),
            });
        } catch (_) {}
        sessionRef.current = null;
    }, [apiToken]);

    return { start, end };
}

// Posiciones de las 8 esferas en los vértices de un cubo
const NODE_POSITIONS = [
    [-1.2,  1.2,  1.2], [ 1.2,  1.2,  1.2],
    [-1.2, -1.2,  1.2], [ 1.2, -1.2,  1.2],
    [-1.2,  1.2, -1.2], [ 1.2,  1.2, -1.2],
    [-1.2, -1.2, -1.2], [ 1.2, -1.2, -1.2],
];

const NODE_COLORS_OFF = 0x334466;
const NODE_COLORS_ON  = [0x7c3aed, 0x06b6d4, 0x10b981, 0xf59e0b, 0xf87171, 0xa78bfa, 0x34d399, 0xfbbf24];

export default function MemoryPulse({ game, apiToken }) {
    const mountRef   = useRef(null);
    const threeRef   = useRef({});  // { scene, camera, renderer, nodes, animId }

    const [phase,    setPhase]    = useState('idle');   // idle | showing | input | success | fail | gameover
    const [level,    setLevel]    = useState(1);
    const [score,    setScore]    = useState(0);
    const [sequence, setSequence] = useState([]);
    const [progress, setProgress] = useState(0);  // cuántos ha acertado el jugador en la ronda

    const sequenceRef = useRef([]);
    const phaseRef    = useRef('idle');
    const inputRef    = useRef(0);

    const { start: startAPI, end: endAPI } = useGameAPI(apiToken, game?.id);

    // ── Iluminar un nodo ───────────────────────────────────────────────────
    const lightNode = useCallback((index, on) => {
        const nodes = threeRef.current.nodes;
        if (!nodes?.[index]) return;
        nodes[index].material.color.setHex(on ? NODE_COLORS_ON[index] : NODE_COLORS_OFF);
        nodes[index].material.emissiveIntensity = on ? 0.8 : 0;
    }, []);

    // ── Reproducir la secuencia ────────────────────────────────────────────
    const playSequence = useCallback(async (seq) => {
        phaseRef.current = 'showing';
        setPhase('showing');
        setProgress(0);
        inputRef.current = 0;

        await new Promise(r => setTimeout(r, 600));

        for (const idx of seq) {
            lightNode(idx, true);
            await new Promise(r => setTimeout(r, 500));
            lightNode(idx, false);
            await new Promise(r => setTimeout(r, 200));
        }

        phaseRef.current = 'input';
        setPhase('input');
    }, [lightNode]);

    // ── Iniciar juego ──────────────────────────────────────────────────────
    const startGame = useCallback(async () => {
        await startAPI();
        const firstIdx = Math.floor(Math.random() * 8);
        const seq      = [firstIdx];
        sequenceRef.current = seq;
        setSequence(seq);
        setLevel(1);
        setScore(0);
        setProgress(0);
        await playSequence(seq);
    }, [startAPI, playSequence]);

    // ── Click en un nodo ───────────────────────────────────────────────────
    const handleNodeClick = useCallback(async (index) => {
        if (phaseRef.current !== 'input') return;

        const seq      = sequenceRef.current;
        const pos      = inputRef.current;
        const expected = seq[pos];

        // Feedback visual rápido
        lightNode(index, true);
        await new Promise(r => setTimeout(r, 200));
        lightNode(index, false);

        if (index !== expected) {
            // Error
            phaseRef.current = 'fail';
            setPhase('gameover');
            await endAPI(score, { level_reached: level });
            return;
        }

        inputRef.current++;
        const newProgress = inputRef.current;
        setProgress(newProgress);

        if (newProgress === seq.length) {
            // Ronda superada
            const newScore = score + seq.length * 10;
            setScore(newScore);
            phaseRef.current = 'success';
            setPhase('success');

            await new Promise(r => setTimeout(r, 700));

            const nextIdx = Math.floor(Math.random() * 8);
            const newSeq  = [...seq, nextIdx];
            sequenceRef.current = newSeq;
            setSequence(newSeq);
            setLevel(prev => prev + 1);
            await playSequence(newSeq);
        }
    }, [score, level, lightNode, endAPI, playSequence]);

    // ── Motor Three.js ─────────────────────────────────────────────────────
    useEffect(() => {
        let THREE, renderer, scene, camera, animId;
        const nodes = [];

        const W = mountRef.current?.clientWidth  ?? 600;
        const H = mountRef.current?.clientHeight ?? 400;

        async function init() {
            THREE = (await import('three')).default ?? await import('three');

            scene  = new THREE.Scene();
            scene.background = new THREE.Color(0x060610);

            camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
            camera.position.set(0, 0, 5.5);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current?.appendChild(renderer.domElement);

            // Luces
            scene.add(new THREE.AmbientLight(0x222244, 3));
            const dLight = new THREE.DirectionalLight(0xaabbff, 2);
            dLight.position.set(3, 5, 5);
            scene.add(dLight);

            // Esfera central decorativa
            const coreGeo = new THREE.SphereGeometry(0.4, 32, 32);
            const coreMat = new THREE.MeshPhongMaterial({ color: 0x111133, wireframe: true, opacity: 0.3, transparent: true });
            scene.add(new THREE.Mesh(coreGeo, coreMat));

            // Nodos
            NODE_POSITIONS.forEach((pos, i) => {
                const geo  = new THREE.SphereGeometry(0.22, 16, 16);
                const mat  = new THREE.MeshPhongMaterial({
                    color:            NODE_COLORS_OFF,
                    emissive:         new THREE.Color(NODE_COLORS_ON[i]),
                    emissiveIntensity: 0,
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(...pos);
                mesh.userData.index = i;
                scene.add(mesh);
                nodes.push(mesh);
            });

            threeRef.current = { scene, camera, renderer, nodes };

            // Raycaster para clicks
            const raycaster = new THREE.Raycaster();
            const mouse     = new THREE.Vector2();

            const onClick = (e) => {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
                mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const hits = raycaster.intersectObjects(nodes);
                if (hits.length > 0) {
                    handleNodeClick(hits[0].object.userData.index);
                }
            };
            renderer.domElement.addEventListener('click', onClick);

            // Loop
            let t = 0;
            function animate() {
                animId = requestAnimationFrame(animate);
                t += 0.01;
                // Rotar suavemente la escena
                scene.rotation.y = Math.sin(t * 0.3) * 0.3;
                scene.rotation.x = Math.sin(t * 0.2) * 0.15;
                renderer.render(scene, camera);
            }
            animate();
        }

        init();

        return () => {
            cancelAnimationFrame(animId);
            if (renderer) { renderer.dispose(); renderer.domElement?.remove(); }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Actualizar handleNodeClick cuando cambia (useCallback deps)
    useEffect(() => {
        const el = threeRef.current.renderer?.domElement;
        if (!el) return;
        // El click se maneja por closure — no necesita re-bind
    }, [handleNodeClick]);

    // ── Labels de fase ─────────────────────────────────────────────────────
    const phaseLabel = {
        idle:     '',
        showing:  'Observa la secuencia…',
        input:    `Tu turno — ${sequence.length - progress} paso${sequence.length - progress !== 1 ? 's' : ''} restante${sequence.length - progress !== 1 ? 's' : ''}`,
        success:  '✓ ¡Correcto! Siguiente ronda…',
        gameover: '',
    }[phase] ?? '';

    return (
        <AppLayout title={game?.title ?? 'Memory Pulse'}>
            <Head title="Memory Pulse" />

            <div className="flex flex-col h-[calc(100vh-120px)] gap-3">

                {/* HUD */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
                    <div className="flex items-center gap-6 text-sm">
                        <span className="text-zinc-500">Nivel <strong className="text-violet-400 text-lg ml-1">{level}</strong></span>
                        <span className="text-zinc-500">Puntos <strong className="text-zinc-300 ml-1">{score}</strong></span>
                    </div>
                    {phaseLabel && (
                        <span className={`text-xs px-3 py-1 rounded-full ${phase === 'input' ? 'bg-violet-900 text-violet-300' : phase === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            {phaseLabel}
                        </span>
                    )}
                </div>

                {/* Canvas Three.js */}
                <div ref={mountRef} className="flex-1 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 relative">

                    {/* Pantalla inicio */}
                    {phase === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
                            <p className="text-5xl mb-4">🧠</p>
                            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Memory Pulse</h2>
                            <p className="text-sm text-zinc-400 mb-8 text-center max-w-xs">
                                Observa qué esferas se iluminan y en qué orden.<br/>
                                Repite la secuencia clickando en las esferas.
                            </p>
                            <button onClick={startGame}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors">
                                Empezar
                            </button>
                        </div>
                    )}

                    {/* Game Over */}
                    {phase === 'gameover' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                            <p className="text-5xl mb-4">💫</p>
                            <h2 className="text-2xl font-bold text-red-400 mb-2">Secuencia incorrecta</h2>
                            <p className="text-zinc-400 mb-1">Llegaste al nivel <strong className="text-white">{level}</strong></p>
                            <p className="text-zinc-500 text-sm mb-6">Puntuación: <strong className="text-white">{score}</strong></p>
                            <div className="flex gap-3">
                                <button onClick={startGame}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors">
                                    Jugar de nuevo
                                </button>
                                <a href={route('player.games.index')}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                                    Volver
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progreso de secuencia */}
                {(phase === 'showing' || phase === 'input') && (
                    <div className="flex gap-1.5 justify-center shrink-0">
                        {sequence.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < progress ? 'bg-violet-500' : i === progress && phase === 'input' ? 'bg-zinc-500 ring-2 ring-violet-500' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
