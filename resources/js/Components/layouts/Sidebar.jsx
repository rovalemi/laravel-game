import { Link } from "@inertiajs/react";
import SidebarItem from "@/Components/shared/SidebarItem";
import Avatar from "@/Components/ui/Avatar";

export default function Sidebar({ user, items, open }) {
    return (
        <aside
            className={`
                fixed top-0 left-0 h-full w-60
                bg-surface border-r border-border
                flex flex-col transition-transform duration-200
                ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
        >
            {/* Brand */}
            <div className="flex items-center gap-2 px-5 py-6 border-b border-border">
                <span className="text-2xl text-accent">⬡</span>
                <span className="font-bold text-sm tracking-wide">GamePlatform</span>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Avatar name={user.name} />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-muted capitalize">{user.role_name}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-3 flex-1">
                {items.map(item => (
                    <SidebarItem key={item.href} {...item} />
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="
                        w-full flex items-center gap-2 px-3 py-2 rounded-lg
                        text-muted hover:text-text hover:bg-border
                        transition-colors
                    "
                >
                    ↩ Cerrar sesión
                </Link>
            </div>
        </aside>
    );
}
