export default function Avatar({ name }) {
    return (
        <div className="
            w-9 h-9 rounded-lg
            bg-linear-to-br from-accent to-accent2
            flex items-center justify-center
            text-white font-bold
        ">
            {name?.[0]?.toUpperCase()}
        </div>
    );
}
