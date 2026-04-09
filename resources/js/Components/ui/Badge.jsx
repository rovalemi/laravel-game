const styles = {
    green: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
    gray: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    red: 'bg-red-950 text-red-400 border border-red-800',
    yellow: 'bg-amber-950 text-amber-400 border border-amber-800',
    blue: 'bg-cyan-950 text-cyan-400 border border-cyan-800',
    violet: 'bg-violet-950 text-violet-400 border border-violet-800',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
    return (
        <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
            ${styles[variant]} ${className}
        `}>
            {children}
        </span>
    );
}
