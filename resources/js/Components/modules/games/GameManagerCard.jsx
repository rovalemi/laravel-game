import { Link } from "@inertiajs/react";

export default function GameManagerCard({ game, onToggle, onDelete }) {
    return (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4 grid grid-cols-[80px_1fr_auto] gap-4 items-center hover:border-violet-500 transition-all">

            {/* THUMB */}
            <div className="w-20 h-16 bg-[#0a0a0f] rounded-lg overflow-hidden flex items-center justify-center">
                {game.thumbnail_path ? (
                    <img
                        src={`/storage/${game.thumbnail_path}`}
                        alt={game.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-3xl text-[#1e1e2e]">◆</span>
                )}
            </div>

            {/* INFO */}
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            game.published
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-slate-500/20 text-slate-400"
                        }`}
                    >
                        {game.published ? "Publicado" : "Borrador"}
                    </span>

                    <span className="text-xs text-slate-500">#{game.id}</span>
                </div>

                <h3 className="text-sm font-semibold text-slate-200 truncate">
                    {game.title}
                </h3>

                <p className="text-xs text-slate-500 truncate">
                    {game.description ?? "Sin descripción"}
                </p>

                <p className="text-xs text-cyan-400 truncate">{game.url}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => onToggle(game)}
                    className={`text-xs px-3 py-1 rounded-md border transition-all ${
                        game.published
                            ? "border-slate-500 text-slate-400 hover:bg-slate-500/10"
                            : "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                >
                    {game.published ? "Despublicar" : "Publicar"}
                </button>

                <Link
                    href={route("manager.games.preview", game.id)}
                    className="text-xs px-3 py-1 rounded-md border border-violet-500 text-violet-400 hover:bg-violet-500/10"
                >
                    Vista previa
                </Link>

                <Link
                    href={route("manager.games.edit", game.id)}
                    className="text-xs px-3 py-1 rounded-md border border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
                    Editar
                </Link>

                <button
                    onClick={() => onDelete(game)}
                    className="text-xs px-3 py-1 rounded-md border border-red-500 text-red-400 hover:bg-red-500/10"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}
