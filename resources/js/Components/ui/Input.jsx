export default function Input({
    id,
    label,
    error,
    hint,
    type = 'text',
    className = '',
    ...props
}) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-zinc-300">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                className={`
                    w-full bg-zinc-950 border rounded-xl px-4 py-2.5 text-sm text-zinc-100
                    placeholder:text-zinc-600 outline-none transition-colors duration-150
                    ${error
                        ? 'border-red-700 focus:border-red-500'
                        : 'border-zinc-800 focus:border-violet-600'
                    }
                    ${className}
                `}
                {...props}
            />
            {hint && !error && (
                <p className="text-xs text-zinc-500">{hint}</p>
            )}
            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}

/**
 * Textarea — igual que Input pero para texto largo
 */
export function Textarea({ id, label, error, hint, rows = 3, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-zinc-300">
                    {label}
                </label>
            )}
            <textarea
                id={id}
                rows={rows}
                className={`
                    w-full bg-zinc-950 border rounded-xl px-4 py-2.5 text-sm text-zinc-100
                    placeholder:text-zinc-600 outline-none transition-colors duration-150 resize-vertical
                    ${error
                        ? 'border-red-700 focus:border-red-500'
                        : 'border-zinc-800 focus:border-violet-600'
                    }
                    ${className}
                `}
                {...props}
            />
            {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

/**
 * Select — desplegable estilizado
 */
export function Select({ id, label, error, children, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-zinc-300">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={`
                    w-full bg-zinc-950 border rounded-xl px-4 py-2.5 text-sm text-zinc-100
                    outline-none transition-colors duration-150 cursor-pointer
                    ${error
                        ? 'border-red-700 focus:border-red-500'
                        : 'border-zinc-800 focus:border-violet-600'
                    }
                    ${className}
                `}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
