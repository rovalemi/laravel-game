export default function AuthBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[#0d0d10]" />

            <div className="
                absolute inset-0
                bg-[linear-gradient(135deg,rgba(124,58,237,0.15),transparent_60%)]
            " />

            <div className="
                absolute inset-0
                bg-[linear-gradient(225deg,rgba(59,130,246,0.12),transparent_70%)]
            " />
        </div>
    );
}
