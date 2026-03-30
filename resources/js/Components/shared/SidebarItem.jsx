import { Link } from "@inertiajs/react";

export default function SidebarItem({ href, icon, label }) {
    return (
        <Link 
            href={href}
            className="
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-muted hover:text-text hover:bg-border
                transition-colors
            "
        >
            <span className="w-5 text-center">{icon}</span>
            <span className="text-sm">{label}</span>
        </Link>
    );
}
