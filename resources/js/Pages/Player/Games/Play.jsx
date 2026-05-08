import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { internalGames } from '@/Pages/Games/internalGames';

export default function PlayerGamesPlay({ game, apiToken }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [chatOpen, setChatOpen] = useState(true);
    const chatEndRef = useRef(null);

    // Cámara
    const videoRef = useRef(null);

    // Emociones
    const [currentEmotion, setCurrentEmotion] = useState('—');

    // API del juego interno
    const gameAPIRef = useRef(null);

    // Detectar si el juego es interno
    const InternalGame =
        game.component && internalGames[game.component]
            ? lazy(internalGames[game.component])
            : null;

    const API = import.meta.env.VITE_APP_URL;

    // ───────────────────────────────────────────────
    // 1. ENCENDER CÁMARA
    // ───────────────────────────────────────────────
    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error('No se pudo acceder a la cámara', err);
            }
        }
        startCamera();
    }, []);

    // ───────────────────────────────────────────────
    // 2. DETECCIÓN DE EMOCIONES (cada 2s)
    // ───────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(async () => {
            if (!videoRef.current) return;
            if (!gameAPIRef.current?.getToken()) return;

            const detection = await faceapi
                .detectSingleFace(videoRef.current)
                .withFaceExpressions();

            if (!detection) return;

            const { expressions } = detection;
            const emotion = Object.keys(expressions).reduce((a, b) =>
                expressions[a] > expressions[b] ? a : b
            );

            setCurrentEmotion(emotion);

            await fetch(`${API}/api/sessions/${gameAPIRef.current.getToken()}/emotions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    emotion,
                    confidence: expressions[emotion],
                    raw: expressions,
                    captured_at: new Date().toISOString(),
                }),
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [API, apiToken]);

    // ───────────────────────────────────────────────
    // 3. CARGAR MENSAJES INICIALES
    // ───────────────────────────────────────────────
    useEffect(() => {
        fetch(`${API}/api/games/${game.id}/messages`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        })
            .then(r => r.ok ? r.json() : [])
            .then(setMessages)
            .catch(() => {});
    }, [API, game.id, apiToken]);

    // ───────────────────────────────────────────────
    // 4. WEBSOCKETS — ESCUCHAR MENSAJES NUEVOS
    // ───────────────────────────────────────────────
    useEffect(() => {
        const channel = window.Echo.channel(`game.${game.id}`);

        channel.listen('MessageSent', (e) => {
            setMessages(prev => [...prev, e]);
        });

        return () => channel.stopListening('MessageSent');
    }, [game.id]);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ───────────────────────────────────────────────
    // 5. ENVIAR MENSAJE
    // ───────────────────────────────────────────────
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        setSending(true);

        try {
            const res = await fetch(`${API}/api/games/${game.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({ content: newMessage.trim() }),
            });

            if (res.ok) {
                const msg = await res.json();
                setMessages(prev => [...prev, msg]);
                setNewMessage('');
            }
        } finally {
            setSending(false);
        }
    };

    // ───────────────────────────────────────────────
    // 6. RENDER
    // ───────────────────────────────────────────────
    return (
        <AppLayout title={game.title}>
            <Head title={`Jugando: ${game.title}`} />

            <div className="flex gap-5 h-[calc(100vh-120px)]">

                {/* Área del juego */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">

                    {/* CONTENEDOR DEL JUEGO */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative">

                        {/* JUEGO EXTERNO */}
                        {game.url && (
                            <iframe
                                src={`${game.url}?token=${encodeURIComponent(apiToken)}&gameId=${game.id}`}
                                className="w-full h-full border-none block"
                                title={game.title}
                                allow="camera; microphone; fullscreen"
                            />
                        )}

                        {/* JUEGO INTERNO */}
                        {InternalGame && (
                            <Suspense fallback={
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    Cargando juego…
                                </div>
                            }>
                                <InternalGame
                                    game={game}
                                    apiToken={apiToken}
                                    bindAPI={(api) => (gameAPIRef.current = api)}
                                />
                            </Suspense>
                        )}

                        {/* ERROR SI NO HAY NADA */}
                        {!game.url && !InternalGame && (
                            <div className="w-full h-full flex items-center justify-center text-red-500">
                                Este juego no tiene URL ni componente interno.
                            </div>
                        )}
                    </div>

                    {/* Barra inferior */}
                    <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-violet-500 text-base">◆</span>
                            <span className="text-sm font-semibold text-zinc-200">{game.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-600">
                                💡 Detección de emociones activa
                            </span>
                            <button
                                onClick={() => setChatOpen(v => !v)}
                                className="text-xs text-zinc-500 hover:text-violet-400 transition-colors lg:hidden"
                            >
                                {chatOpen ? 'Ocultar chat' : 'Mostrar chat'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel lateral: Cámara + Emociones + Chat */}
                <div className={`
                    w-72 shrink-0 flex flex-col gap-4
                    ${chatOpen ? 'flex' : 'hidden lg:flex'}
                `}>

                    {/* Cámara */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                        <p className="text-sm text-zinc-400 mb-2">Cámara</p>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-40 object-cover rounded-xl border border-zinc-800"
                        />
                    </div>

                    {/* Emociones */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                        <p className="text-sm text-zinc-400">Estado emocional</p>
                        <p className="text-lg font-semibold text-violet-400 mt-1">
                            {currentEmotion}
                        </p>
                    </div>

                    {/* Chat */}
                    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-80">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
                            <span className="text-sm font-semibold text-zinc-200">Chat del juego</span>
                            <span className="flex items-center gap-1.5 text-xs text-cyan-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                En vivo
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                            {messages.length === 0 && (
                                <p className="text-xs text-zinc-600 text-center mt-6">
                                    Sé el primero en escribir…
                                </p>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} className="bg-zinc-800 rounded-xl px-3 py-2">
                                    <p className="text-xs font-semibold text-cyan-400 mb-0.5">
                                        {msg.user?.name ?? 'Anónimo'}
                                    </p>
                                    <p className="text-sm text-zinc-200 leading-snug">
                                        {msg.content}
                                    </p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-zinc-800 shrink-0">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje…"
                                maxLength={500}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-600 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
