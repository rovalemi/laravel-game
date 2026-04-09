import { Head, Link } from "@inertiajs/react";

import ErrorLayout from "@/Layouts/ErrorLayout";

export default function MethodNotAllowed() {
    return (
        <ErrorLayout title="Ruta no permitida">
            <Head title="Error 405 — Ruta no permitida" />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
                <h1 className="text-7xl font-bold text-red-500 mb-6">405</h1>

                <p className="text-zinc-400 text-lg mb-8">
                    Esta ruta no existe o no está permitida en el sistema.
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
