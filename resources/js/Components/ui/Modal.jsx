import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 'md' }) {
    // Cerrar con Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const widths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`
                relative w-full ${widths[maxWidth]}
                bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl
                animate-in fade-in zoom-in-95 duration-150
            `}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-100 transition-colors text-lg leading-none"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
