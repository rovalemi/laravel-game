import { Head, Link } from "@inertiajs/react";

import ErrorLayout from "@/Layouts/ErrorLayout";

export default function NotFound() {
    return (
        <ErrorLayout title="Página no encontrada">
            <Head title="Error 404 — Página no encontrada" />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
                <h1 className="text-7xl font-bold text-amber-500 mb-6">404</h1>

                <p className="text-zinc-400 text-lg mb-8">
                    La página que buscas no existe o ha sido movida.
                </p>

                <Link
                    href="/"
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all"
                >
                    Volver al inicio
                </Link>
            </div>
        </ErrorLayout>
    );
}
