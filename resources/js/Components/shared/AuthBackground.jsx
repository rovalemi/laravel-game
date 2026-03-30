export default function AuthBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="
                absolute inset-0 opacity-40
                bg-[linear-gradient(#1e1e2e_1px,transparent_1px),linear-gradient(90deg,#1e1e2e_1px,transparent_1px)]
                bg-size-[40px_40px]
            " />

            <div className="
                absolute top-1/5 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-150 h-150
                bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_70%)]
            " />
        </div>
    );
}
