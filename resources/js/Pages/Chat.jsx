import Echo from "laravel-echo";
import { useEffect, useState } from "react";

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");

    useEffect(() => {
        window.Echo.channel("chat").listen("MessageSent", (e) => {
            setMessages((prev) => [...prev, e.message]);
        });
    }, []);

    const sendMessage = async () => {
        await axios.post("/chat", { content });
        setContent("");
    };

    return (
        <div>
            <h1>Chat en tiempo real</h1>

            <div>
                {messages.map((m) => (
                    <p key={m.id}><b>{m.user.name}:</b> {m.content}</p>
                ))}
            </div>

            <input value={content} onChange={(e) => setContent(e.target.value)} />
            <button onClick={sendMessage}>Enviar</button>
        </div>
    );
}
