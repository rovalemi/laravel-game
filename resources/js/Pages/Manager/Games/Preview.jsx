import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/shared/PageHeader';
import { Badge, Button } from '@/Components/ui';

export default function ManagerGamesPreview({ game }) {
    return (
        <AppLayout title="Vista previa">
            <Head title={`Vista previa: ${game.title}`} />

            <PageHeader
                title={game.title}
                subtitle="Vista previa del gestor — el jugador verá esto mismo al acceder"
                action={
                    <div className="flex items-center gap-3">
                        <Badge variant={game.published ? 'green' : 'gray'}>
                            {game.published ? 'Publicado' : 'Borrador'}
                        </Badge>
                        <Link href={route('manager.games.edit', game.id)}>
                            <Button variant="secondary" size="md">Editar</Button>
                        </Link>
                        <Link href={route('manager.games.index')}>
                            <Button variant="ghost" size="md">← Volver</Button>
                        </Link>
                    </div>
                }
            />

            {/* Aviso de modo previsualización */}
            <div className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 text-sm">
                <span className="text-base">👁</span>
                <span>
                    Estás en modo previsualización. El juego se carga desde{' '}
                    <code className="font-mono text-xs bg-amber-900/40 px-1.5 py-0.5 rounded">{game.url}</code>
                </span>
            </div>

            {/* Iframe del juego */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
                {game.url ? (
                    <iframe
                        src={game.url}
                        className="w-full h-full border-none"
                        title={`Vista previa: ${game.title}`}
                        allow="camera; microphone; fullscreen"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                        <span className="text-4xl mb-3">◆</span>
                        <p className="text-sm">No hay URL configurada para este juego.</p>
                        <Link href={route('manager.games.edit', game.id)} className="mt-3">
                            <Button variant="secondary" size="sm">Configurar URL</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Info técnica */}
            <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                    { label: 'ID del juego', value: `#${game.id}` },
                    { label: 'Estado',       value: game.published ? 'Publicado' : 'Borrador' },
                    { label: 'URL',          value: game.url || '—' },
                ].map(item => (
                    <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                        <p className="text-xs text-zinc-600 mb-1">{item.label}</p>
                        <p className="text-sm font-mono text-zinc-300 truncate" title={item.value}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
