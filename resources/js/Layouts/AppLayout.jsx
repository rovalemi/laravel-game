import { usePage } from "@inertiajs/react";
import { useState } from "react";
import Sidebar from "@/Components/layouts/Sidebar";
import Topbar from "@/Components/layouts/Topbar";

export default function AppLayout({ children, title }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const role = user?.role_name;
    const [open, setOpen] = useState(false);

    const navItems = {
        administrador: [
            { href: route("admin.dashboard"), label: "Dashboard", icon: "◈" },
            { href: route("admin.users.index"), label: "Usuarios", icon: "◉" },
            { href: route("manager.games.index"), label: "Juegos", icon: "◆" },
        ],
        gestor: [
            { href: route("manager.dashboard"), label: "Dashboard", icon: "◈" },
            { href: route("manager.games.index"), label: "Mis Juegos", icon: "◆" },
        ],
        jugador: [
            { href: route("player.games.index"), label: "Juegos", icon: "◆" },
            { href: route("player.games.history"), label: "Mis Partidas", icon: "◉" },
        ],
    };

    const items = navItems[role] ?? [];

    return (
        <div className="min-h-screen bg-bg text-text flex">
            <Sidebar user={user} items={items} open={open} />

            <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
                <Topbar title={title} onMenu={() => setOpen(!open)} />

                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
