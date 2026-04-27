import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';

/**
 * Space Debris — juego Three.js integrado como página Inertia.
 *
 * Mecánica: mueve la nave con el ratón, esquiva los fragmentos de asteroide.
 * El juego usa Three.js para el renderizado 3D y Howler.js para el audio.
 *
 * Por qué Inertia en lugar de iframe:
 *   - El apiToken llega directamente por props de Laravel
 *   - Comparte el AppLayout (el jugador sabe que está en la plataforma)
 *   - No hay problemas de CORS ni de comunicación cross-frame
 */

// ── Hook de la API de Laravel ──────────────────────────────────────────────
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
            if (res.ok) {
                const data = await res.json();
                sessionRef.current = data.session_token;
            }
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

export default function SpaceDebris({ game, apiToken }) {
    const mountRef  = useRef(null);
    const stateRef  = useRef({ running: false, score: 0, lives: 3, speed: 1 });

    const [score,     setScore]     = useState(0);
    const [lives,     setLives]     = useState(3);
    const [phase,     setPhase]     = useState('idle');   // idle | playing | gameover
    const [bestScore, setBestScore] = useState(0);

    const { start: startAPI, end: endAPI } = useGameAPI(apiToken, game?.id);

    const startGame = useCallback(async () => {
        setScore(0);
        setLives(3);
        setPhase('playing');
        stateRef.current = { running: true, score: 0, lives: 3, speed: 1 };
        await startAPI();
    }, [startAPI]);

    const endGame = useCallback(async (finalScore) => {
        stateRef.current.running = false;
        setPhase('gameover');
        setBestScore(prev => Math.max(prev, finalScore));
        await endAPI(finalScore, { lives_left: stateRef.current.lives });
    }, [endAPI]);

    // ── Motor Three.js ─────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'playing') return;

        let THREE, Howl, renderer, scene, camera, animId;
        let ship, debris = [], stars = [];
        let mouseX = 0, mouseY = 0;
        let spawnTimer = 0;
        let scoreAcc = 0;

        const W = mountRef.current.clientWidth;
        const H = mountRef.current.clientHeight;

        async function init() {
            // Importar Three.js dinámicamente
            THREE = (await import('three')).default ?? await import('three');

            // ── Escena ─────────────────────────────────────────────────────
            scene    = new THREE.Scene();
            scene.background = new THREE.Color(0x000510);
            scene.fog        = new THREE.Fog(0x000510, 20, 80);

            camera   = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
            camera.position.z = 5;

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current?.appendChild(renderer.domElement);

            // ── Luz ────────────────────────────────────────────────────────
            scene.add(new THREE.AmbientLight(0x334466, 2));
            const dLight = new THREE.DirectionalLight(0x88aaff, 3);
            dLight.position.set(5, 5, 5);
            scene.add(dLight);

            // ── Nave del jugador ───────────────────────────────────────────
            const shipGeo  = new THREE.ConeGeometry(0.15, 0.6, 8);
            const shipMat  = new THREE.MeshPhongMaterial({ color: 0x7c3aed, emissive: 0x3b1d8a });
            ship = new THREE.Mesh(shipGeo, shipMat);
            ship.rotation.x = -Math.PI / 2;
            scene.add(ship);

            // ── Estrellas de fondo ─────────────────────────────────────────
            const starGeo = new THREE.BufferGeometry();
            const starPos = new Float32Array(600);
            for (let i = 0; i < 600; i += 3) {
                starPos[i]     = (Math.random() - 0.5) * 60;
                starPos[i + 1] = (Math.random() - 0.5) * 60;
                starPos[i + 2] = (Math.random() - 0.5) * 60;
            }
            starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
            const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 });
            scene.add(new THREE.Points(starGeo, starMat));

            // ── Loop de animación ──────────────────────────────────────────
            let lastTime = performance.now();

            function animate(now) {
                if (!stateRef.current.running) return;
                animId = requestAnimationFrame(animate);

                const dt = Math.min((now - lastTime) / 1000, 0.05);
                lastTime = now;

                const s = stateRef.current;

                // Mover nave hacia el ratón suavemente
                ship.position.x += (mouseX * 3 - ship.position.x) * 8 * dt;
                ship.position.y += (mouseY * 2 - ship.position.y) * 8 * dt;

                // Spawn de escombros
                spawnTimer += dt;
                const spawnInterval = Math.max(0.3, 1.2 - s.speed * 0.08);
                if (spawnTimer > spawnInterval) {
                    spawnTimer = 0;
                    spawnDebris(THREE, scene, debris, s.speed);
                }

                // Mover y comprobar colisiones
                for (let i = debris.length - 1; i >= 0; i--) {
                    const d = debris[i];
                    d.position.z  += (3 + s.speed * 0.5) * dt;
                    d.rotation.x  += dt * d.userData.rotX;
                    d.rotation.y  += dt * d.userData.rotY;

                    // Salió de pantalla
                    if (d.position.z > 7) {
                        scene.remove(d);
                        debris.splice(i, 1);
                        // Sumar puntos
                        scoreAcc += 1;
                        s.score = scoreAcc;
                        setScore(scoreAcc);
                        s.speed = 1 + Math.floor(scoreAcc / 10) * 0.4;
                        continue;
                    }

                    // Colisión con la nave
                    const dist = d.position.distanceTo(ship.position);
                    if (dist < 0.45) {
                        scene.remove(d);
                        debris.splice(i, 1);
                        s.lives -= 1;
                        setLives(s.lives);

                        if (s.lives <= 0) {
                            s.running = false;
                            endGame(scoreAcc);
                            return;
                        }
                    }
                }

                renderer.render(scene, camera);
            }

            animate(performance.now());
        }

        function spawnDebris(THREE, scene, arr, speed) {
            const colors = [0xf87171, 0xfbbf24, 0x94a3b8, 0xa78bfa];
            const size   = 0.15 + Math.random() * 0.25;
            const geo    = Math.random() > 0.5
                ? new THREE.OctahedronGeometry(size)
                : new THREE.TetrahedronGeometry(size);
            const mat    = new THREE.MeshPhongMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                flatShading: true,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 5,
                -30 - Math.random() * 10,
            );
            mesh.userData = { rotX: (Math.random() - 0.5) * 4, rotY: (Math.random() - 0.5) * 4 };
            scene.add(mesh);
            arr.push(mesh);
        }

        // ── Eventos de ratón ───────────────────────────────────────────────
        const onMouseMove = (e) => {
            const rect = mountRef.current?.getBoundingClientRect();
            if (!rect) return;
            mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
            mouseY = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        };

        const onTouchMove = (e) => {
            e.preventDefault();
            const t    = e.touches[0];
            const rect = mountRef.current?.getBoundingClientRect();
            if (!rect) return;
            mouseX = ((t.clientX - rect.left) / rect.width  - 0.5) * 2;
            mouseY = -((t.clientY - rect.top)  / rect.height - 0.5) * 2;
        };

        mountRef.current?.addEventListener('mousemove', onMouseMove);
        mountRef.current?.addEventListener('touchmove', onTouchMove, { passive: false });

        init();

        // ── Limpieza ───────────────────────────────────────────────────────
        return () => {
            stateRef.current.running = false;
            cancelAnimationFrame(animId);
            mountRef.current?.removeEventListener('mousemove', onMouseMove);
            mountRef.current?.removeEventListener('touchmove', onTouchMove);
            if (renderer) {
                renderer.dispose();
                renderer.domElement?.remove();
            }
        };
    }, [phase]);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <AppLayout title={game?.title ?? 'Space Debris'}>
            <Head title="Space Debris" />

            <div className="flex flex-col h-[calc(100vh-120px)] gap-3">

                {/* HUD */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
                    <div className="flex items-center gap-6 text-sm">
                        <span className="text-zinc-500">Puntos <strong className="text-violet-400 text-lg ml-1">{score}</strong></span>
                        <span className="text-zinc-500">Mejor <strong className="text-zinc-300 ml-1">{bestScore}</strong></span>
                    </div>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < lives ? 'text-red-400' : 'text-zinc-800'}`}>♥</span>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div ref={mountRef} className="flex-1 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 relative cursor-none">

                    {/* Pantalla de inicio */}
                    {phase === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
                            <p className="text-5xl mb-4">🚀</p>
                            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Space Debris</h2>
                            <p className="text-sm text-zinc-400 mb-8 text-center max-w-xs">
                                Mueve el ratón para esquivar los fragmentos.<br/>Tienes 3 vidas.
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
                            <p className="text-5xl mb-4">💥</p>
                            <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over</h2>
                            <p className="text-zinc-400 mb-1">Puntuación: <strong className="text-white">{score}</strong></p>
                            {score >= bestScore && score > 0 && (
                                <p className="text-yellow-400 text-sm mb-6">¡Nuevo récord! 🏆</p>
                            )}
                            <div className="flex gap-3 mt-4">
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

                <p className="text-center text-xs text-zinc-700 shrink-0">Mueve el ratón para esquivar · ♥ ♥ ♥ tres vidas</p>
            </div>
        </AppLayout>
    );
}
