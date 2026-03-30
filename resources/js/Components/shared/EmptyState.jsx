export default function EmptyState({ icon = "◆", message, hint }) {
    return (
        <div className="text-center p-16 bg-[#12121a] border border-dashed border-[#1e1e2e] rounded-2xl text-slate-500">
            <span className="text-5xl opacity-20 block mb-4">{icon}</span>
            <p>{message}</p>
            {hint && (
                <span className="text-xs opacity-60 block mt-2">{hint}</span>
            )}
        </div>
    );
}
