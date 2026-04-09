import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import { StatCard, PageHeader } from '@/Components/shared';

export default function AdminDashboard({ stats = {} }) {
    const cards = [
        { label: 'Usuarios totales', value: stats.users ?? '—', icon: '◉', color: 'violet' },
        { label: 'Juegos publicados', value: stats.published_games ?? '—', icon: '◆', color: 'cyan' },
        { label: 'Sesiones hoy', value: stats.sessions_today ?? '—', icon: '◈', color: 'green' },
        { label: 'Jugadores activos', value: stats.active_players ?? '—', icon: '⬡', color: 'amber' },
    ];

    const quickActions = [
        { href: route('admin.users.index'), label: 'Gestionar usuarios', icon: '◈', desc: 'Ver, editar y eliminar usuarios' },
        { href: route('manager.dashboard'), label: 'Gestionar juegos', icon: '◈', desc: 'Ver, editar y eliminar juegos' },
        { href: route('manager.games.index'), label: 'Ver juegos', icon: '◆', desc: 'Gestionar catálogo de juegos' },
    ];

    return (
        <AppLayout title="Dashboard">
            <Head title="Admin — Dashboard" />

            <PageHeader
                title="Panel de administración"
                subtitle="Visión general del sistema"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {cards.map(c => (
                    <StatCard key={c.label} {...c} />
                ))}
            </div>

            {/* Acciones rápidas */}
            <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    Acciones rápidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {quickActions.map(action => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-150"
                        >
                            <span className="text-2xl text-violet-500 mt-0.5">{action.icon}</span>
                            <div>
                                <p className="text-sm font-semibold text-zinc-100 mb-0.5">{action.label}</p>
                                <p className="text-xs text-zinc-500">{action.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
