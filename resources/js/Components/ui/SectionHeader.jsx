export default function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-200">{title}</h2>
            {subtitle && (
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
        </div>
    );
}
