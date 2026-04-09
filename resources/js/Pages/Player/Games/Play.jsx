import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';

export default function PlayerGamesPlay({ game, apiToken }) {
    const [messages, setMessages]     = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending]       = useState(false);
    const [chatOpen, setChatOpen]     = useState(true);
    const chatEndRef                  = useRef(null);

    useEffect(() => {
        fetch(`/api/games/${game.id}/messages`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        })
            .then(r => r.ok ? r.json() : [])
            .then(setMessages)
            .catch(() => {});
    }, [game.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/api/games/${game.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content,
                },
                body: JSON.stringify({ message: newMessage.trim() }),
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

    return (
        <AppLayout title={game.title}>
            <Head title={`Jugando: ${game.title}`} />

            <div className="flex gap-5 h-[calc(100vh-120px)]">

                {/*  Área del juego  */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">

                    {/* Iframe del juego */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                        <iframe
                            src={`${game.url}?token=${encodeURIComponent(apiToken)}&gameId=${game.id}`}
                            className="w-full h-full border-none block"
                            title={game.title}
                            allow="camera; microphone; fullscreen"
                        />
                    </div>

                    {/* Barra inferior */}
                    <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-violet-500 text-base">◆</span>
                            <span className="text-sm font-semibold text-zinc-200">{game.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-600">
                                💡 Detección de emociones activa durante la partida
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

                {/* Panel de chat */}
                <div className={`
                    w-72 shrink-0 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden
                    transition-all duration-200
                    ${chatOpen ? 'flex' : 'hidden lg:flex'}
                `}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
                        <span className="text-sm font-semibold text-zinc-200">Chat del juego</span>
                        <span className="flex items-center gap-1.5 text-xs text-cyan-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            En vivo
                        </span>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
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
                                <p className="text-sm text-zinc-200 break-words leading-snug">
                                    {msg.message}
                                </p>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-zinc-800 shrink-0">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje…"
                            maxLength={500}
                            className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-600 transition-colors"
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
        </AppLayout>
    );
}
