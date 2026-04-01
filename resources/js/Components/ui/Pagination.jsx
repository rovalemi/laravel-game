import { Link } from '@inertiajs/react';

/**
 * Pagination — paginación compatible con los links que devuelve Laravel
 *
 * Uso:
 *   <Pagination links={users.links} />
 *
 * `links` es el array de { url, label, active } que devuelve paginate() de Eloquent
 */
export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Paginación">
            {links.map((link, i) => (
                link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        className={`
                            px-3 py-1.5 rounded-lg text-sm transition-colors duration-150
                            ${link.active
                                ? 'bg-violet-600 text-white font-semibold'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
                            }
                        `}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg text-sm text-zinc-600 cursor-not-allowed"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </nav>
    );
}
