export default function Topbar({ title, onMenu }) {
    return (
        <header className="
            h-14 bg-surface border-b border-border
            flex items-center gap-4 px-6 sticky top-0 z-50
        ">
            <button 
                className="md:hidden text-muted text-xl"
                onClick={onMenu}
            >
                ☰
            </button>

            {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </header>
    );
}
