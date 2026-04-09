export default function ErrorLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center p-8">
            <div className="w-full max-w-xl">
                {children}
            </div>
        </div>
    );
}
