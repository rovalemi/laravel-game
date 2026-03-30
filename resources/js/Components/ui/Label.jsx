export default function Label({ children, ...props }) {
    return (
        <label
            {...props}
            className="text-sm font-medium text-text"
        >
            {children}
        </label>
    );
}
