export default function Button({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={
                `
                bg-linear-to-br from-accent to-purple-700
                text-white font-semibold text-sm
                px-4 py-2.5 rounded-lg
                disabled:opacity-60 disabled:cursor-not-allowed
                hover:opacity-90 transition
                ` + className
            }
        >
            {children}
        </button>
    );
}
