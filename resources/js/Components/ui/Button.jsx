export default function Button({
    children,
    variant  = 'primary',
    size = 'md',
    as = 'button',
    disabled = false,
    loading = false,
    className = '',
    ...props
}) {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary:   'bg-violet-600 text-white border border-violet-700 hover:bg-violet-500',
        secondary: 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700',
        success:   'bg-emerald-700/20 text-emerald-300 border border-emerald-700 hover:bg-emerald-700/30',
        warning:   'bg-amber-700/20 text-amber-300 border border-amber-700 hover:bg-amber-700/30',
        danger:    'bg-red-700/20 text-red-300 border border-red-700 hover:bg-red-700/30',
        ghost:     'bg-zinc-900/40 text-zinc-300 border border-zinc-800 hover:bg-zinc-800/60',
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
