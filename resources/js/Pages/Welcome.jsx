import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Bienvenido" /> 

            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

                {/* Nav */}
                <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl text-violet-500">⬡</span>
                        <span className="font-bold tracking-wide text-lg">GamePlatform</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('login')}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            href={route('register')}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors"
                        >
                            Registrarse
                        </Link>
                    </div>
                </nav>

                {/* Hero */}
                <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                    {/* Glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full text-xs font-medium bg-violet-950 border border-violet-800 text-violet-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                            Plataforma de juegos en línea
                        </div>

                        <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-6">
                            Juega. Compite.{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-cyan-400">
                                Evoluciona.
                            </span>
                        </h1>

                        <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
                            Accede a juegos 3D desarrollados con Three.js, compite con otros jugadores
                            y consulta tus estadísticas en tiempo real.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Link
                                href={route('register')}
                                className="px-6 py-3 rounded-xl font-semibold text-sm bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-900/40"
                            >
                                Empezar gratis
                            </Link>
                            <Link
                                href={route('login')}
                                className="px-6 py-3 rounded-xl font-semibold text-sm border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 transition-all"
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center py-6 text-xs text-zinc-600 border-t border-zinc-900">
                    Alizon Rosales — 2DAW — GamePlatform — Desarrollo Web en Entorno Servidor
                </footer>
            </div>
        </>
    );
}
