export default function Input({ className = "", ...props }) {
    return (
        <input 
            {...props}
            className={
                `
                bg-bg border border-border rounded-lg px-4 py-2.5
                text-text text-sm outline-none
                focus:border-accent transition-colors
                ` + className 
            }
        />
    );
}
