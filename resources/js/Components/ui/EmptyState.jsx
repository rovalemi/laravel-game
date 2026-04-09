export default function EmptyState({ icon = '◆', title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50">
            <span className="text-5xl opacity-20 mb-4 block">{icon}</span>
            {title && <p className="text-base font-semibold text-zinc-300 mb-1">{title}</p>}
            {description && <p className="text-sm text-zinc-500 mb-6">{description}</p>}
            {action && action}
        </div>
    );
}
