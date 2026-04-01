/**
 * Button — componente base reutilizable
 *
 * Variantes: primary | secondary | danger | ghost
 * Tamaños:   sm | md | lg
 * Soporta: as="a" para links, disabled, loading
 */
export default function Button({
    children,
    variant  = 'primary',
    size     = 'md',
    as       = 'button',
    disabled = false,
    loading  = false,
    className = '',
    ...props
}) {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary:   'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30',
        secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
        danger:    'bg-red-950 hover:bg-red-900 text-red-400 border border-red-800',
        ghost:     'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100',
        success:   'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800',
    };

    const sizes = {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-sm px-6 py-3',
    };

    const Tag = as;

    return (
        <Tag
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            )}
            {children}
        </Tag>
    );
}
