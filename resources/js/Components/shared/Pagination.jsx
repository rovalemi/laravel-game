import { Link } from "@inertiajs/react";

export default function Pagination({ links }) {
    return (
        <div className="flex justify-center gap-2 mt-6">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url ?? "#"}
                    className={`px-3 py-1 rounded-md text-sm border border-[#1e1e2e] bg-[#12121a] text-slate-300 transition-all
                        ${link.active ? "bg-violet-600 border-violet-600 text-white" : ""}
                        ${!link.url ? "opacity-40 pointer-events-none" : "hover:border-violet-500 hover:text-violet-400"}
                    `}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
