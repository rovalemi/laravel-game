import { Link } from "@inertiajs/react";

export default function GameCard({ game }) {
    return (
        <div className="group bg-[#12121a] border border-[#1e1e2e] rounded-xl overflow-hidden transition-all hover:border-violet-500 hover:-translate-y-1">
            
            {/* THUMBNAIL */}
            <div className="relative w-full aspect-video bg-[#0a0a0f] overflow-hidden">
                {game.thumbnail_path ? (
                    <img
                        src={`/storage/${game.thumbnail_path}`}
                        alt={game.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-[#1e1e2e]">
                        ◆
                    </div>
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Link
                        href={route('player.games.play', game.id)}
                        className="bg-linear-to-br from-violet-600 to-violet-800 text-white font-bold text-sm px-6 py-2 rounded-full transform scale-90 transition-transform group-hover:scale-100"
                    >
                        ▶ Jugar
                    </Link>
                </div>
            </div>

            {/* INFO */}
            <div className="p-4">
                <h3 className="text-base font-semibold text-slate-200 mb-1">
                    {game.title}
                </h3>

                {game.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {game.description}
                    </p>
                )}
            </div>
        </div>
    );
}
