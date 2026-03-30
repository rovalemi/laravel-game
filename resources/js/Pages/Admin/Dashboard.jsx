import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function AdminDashboard({ stats = {} }) {
    const cards = [
        { label: 'Usuarios totales', value: stats.users ?? '—', icon: '◉', color: 'text-violet-500' },
        { label: 'Juegos publicados', value: stats.published_games ?? '—', icon: '◆', color: 'text-cyan-400' },
        { label: 'Sesiones hoy', value: stats.sessions_today ?? '—', icon: '◈', color: 'text-emerald-500' },
        { label: 'Jugadores activos', value: stats.active_players ?? '—', icon: '⬡', color: 'text-amber-400' },
    ];

    return (
        <AppLayout title="Dashboard Administrador">
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-10">

                {/* GRID DE ESTADÍSTICAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map(card => (
                        <div
                            key={card.label}
                            className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-6 flex flex-col gap-2 transition-colors hover:border-violet-500"
                        >
                            <div className={`text-3xl ${card.color}`}>{card.icon}</div>
                            <div className="text-3xl font-extrabold text-slate-200 leading-none">
                                {card.value}
                            </div>
                            <div className="text-xs text-slate-500">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* ACCIONES RÁPIDAS */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">
                        Acciones rápidas
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Link
                            href={route('admin.users.create')}
                            className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5 flex flex-col items-center gap-3 hover:border-violet-500 hover:-translate-y-1 transition-all"
                        >
                            <span className="text-2xl text-violet-500">◉</span>
                            <span className="text-sm font-medium text-slate-200 text-center">
                                Nuevo usuario
                            </span>
                        </Link>

                        <Link
                            href={route('admin.users.index')}
                            className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5 flex flex-col items-center gap-3 hover:border-violet-500 hover:-translate-y-1 transition-all"
                        >
                            <span className="text-2xl text-violet-500">◈</span>
                            <span className="text-sm font-medium text-slate-200 text-center">
                                Gestionar usuarios
                            </span>
                        </Link>

                        <Link
                            href={route('manager.games.index')}
                            className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5 flex flex-col items-center gap-3 hover:border-violet-500 hover:-translate-y-1 transition-all"
                        >
                            <span className="text-2xl text-violet-500">◆</span>
                            <span className="text-sm font-medium text-slate-200 text-center">
                                Ver todos los juegos
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
