export default function AuthCard({ children }) {
    return (
        <div className="
            bg-surface border border-border rounded-2xl
            p-10 w-full max-w-md relative z-10
            shadow-[0_25px_50px_rgba(0,0,0,0.5)]
        ">
            {children}
        </div>
    );
}
