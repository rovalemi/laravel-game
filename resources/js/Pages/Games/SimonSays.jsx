import { useEffect, useState, useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import * as faceapi from "face-api.js";

export default function SimonSays({ game }) {
    const { props } = usePage();
    const user = props.auth.user;

    // ───────────────────────────────────────────────
    // ESTADO DEL JUEGO
    // ───────────────────────────────────────────────
    const colors = ["red", "green", "blue", "yellow"];
    const [sequence, setSequence] = useState([]);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [highlight, setHighlight] = useState(null);
    const [score, setScore] = useState(0);

    // ───────────────────────────────────────────────
    // SESIÓN DE JUEGO (API)
    // ───────────────────────────────────────────────
    const [sessionToken, setSessionToken] = useState(null);

    useEffect(() => {
        startSession();
    }, []);

    const startSession = async () => {
        const res = await axios.post("/api/sessions", {
            game_id: game.id,
        });

        setSessionToken(res.data.token);
    };

    const finishSession = async () => {
        if (!sessionToken) return;

        await axios.patch(`/api/sessions/${sessionToken}/finish`, {
            score,
        });
    };

    // ───────────────────────────────────────────────
    // EMOCIONES (face-api.js)
    // ───────────────────────────────────────────────
    const videoRef = useRef(null);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");

        startCamera();
    };

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        detectLoop();
    };

    const detectLoop = async () => {
        setInterval(async () => {
            if (!videoRef.current || !sessionToken) return;

            const detection = await faceapi
                .detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceExpressions();

            if (!detection) return;

            const expressions = detection.expressions;
            const emotion = Object.keys(expressions).reduce((a, b) =>
                expressions[a] > expressions[b] ? a : b
            );

            const confidence = expressions[emotion];

            // Enviar a la API
            await axios.post(`/api/sessions/${sessionToken}/emotions`, {
                emotion,
                confidence,
            });
        }, 2000); // cada 2 segundos
    };

    // ───────────────────────────────────────────────
    // CHAT (Reverb + Echo)
    // ───────────────────────────────────────────────
    useEffect(() => {
        if (!game.id) return;

        const channel = window.Echo.channel(`game.${game.id}`);

        channel.listen("MessageSent", (e) => {
            console.log("Nuevo mensaje:", e.message);
        });

        return () => window.Echo.leave(`game.${game.id}`);
    }, [game.id]);

    // ───────────────────────────────────────────────
    // LÓGICA DEL JUEGO
    // ───────────────────────────────────────────────
    const startGame = () => {
        setSequence([]);
        setScore(0);
        addColor();
    };

    const addColor = () => {
        const next = colors[Math.floor(Math.random() * colors.length)];
        const newSeq = [...sequence, next];
        setSequence(newSeq);
        playSequence(newSeq);
    };

    const playSequence = async (seq) => {
        setIsPlayerTurn(false);

        for (let i = 0; i < seq.length; i++) {
            setHighlight(seq[i]);
            await new Promise((r) => setTimeout(r, 600));
            setHighlight(null);
            await new Promise((r) => setTimeout(r, 200));
        }

        setPlayerIndex(0);
        setIsPlayerTurn(true);
    };

    const handlePlayerClick = (color) => {
        if (!isPlayerTurn) return;

        if (color !== sequence[playerIndex]) {
            alert("Game Over!");
            finishSession();
            return;
        }

        if (playerIndex + 1 === sequence.length) {
            setScore(score + 1);
            setIsPlayerTurn(false);
            setTimeout(addColor, 800);
        } else {
            setPlayerIndex(playerIndex + 1);
        }
    };

    // ───────────────────────────────────────────────
    // UI
    // ───────────────────────────────────────────────
    return (
        <>
            <Head title="Simon Says" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
                <h1 className="text-4xl font-bold mb-6">Simon Says</h1>

                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-48 h-36 rounded-lg mb-6 border border-gray-700"
                />

                <p className="text-lg mb-4">
                    Jugador: <b>{user.name}</b>
                </p>

                <p className="text-xl mb-6">
                    Puntuación: <b>{score}</b>
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => handlePlayerClick(c)}
                            className={`w-32 h-32 rounded-lg transition-all ${
                                highlight === c ? "opacity-100" : "opacity-50"
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <button
                    onClick={startGame}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg"
                >
                    Iniciar juego
                </button>
            </div>
        </>
    );
}
