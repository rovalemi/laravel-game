export default function Toggle({ checked, onChange, label, hint }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            {/* Track */}
            <div className="relative mt-0.5 shrink-0">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                />
                <div className={`
                    w-11 h-6 rounded-full transition-colors duration-200
                    ${checked ? 'bg-violet-600' : 'bg-zinc-700'}
                `}>
                    <div className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                        transition-transform duration-200
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                </div>
            </div>

            {/* Labels */}
            <div>
                <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                    {checked ? label ?? 'Activo' : label ? `${label} (desactivado)` : 'Inactivo'}
                </span>
                {hint && (
                    <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>
                )}
            </div>
        </label>
    );
}
