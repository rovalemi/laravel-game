export default function Error({ message }) {
    if (!message) return null;
    
    return (
        <span className="text-red-400 text-xs">
            {message}
        </span>
    );
}
