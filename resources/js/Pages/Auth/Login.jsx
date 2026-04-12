import { useForm, Head } from "@inertiajs/react";
import { useEffect, useRef } from "react";

import { AuthBackground, AuthCard } from "@/Components/shared";
import { Label, Input, Error, Button } from "@/Components/ui";

export default function Login() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        face_image: "",
        remember: false,
    });

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
            });
    }, []);

    const captureFace = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const base64 = canvas.toDataURL("image/jpeg");
        setData("face_image", base64);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div className="min-h-screen flex items-center justify-center p-6 relative bg-bg text-text">
                <AuthBackground />

                <AuthCard>
                    <div className="flex items-center gap-3 mb-7">
                        <span className="text-3xl text-accent">⬡</span>
                        <span className="text-lg font-bold">GamePlatform</span>
                    </div>

                    <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
                    <p className="text-sm text-muted mt-1 mb-7">
                        Accede a tu cuenta para continuar
                    </p>

                    {/* Cámara */}
                    <div className="mb-4 flex flex-col items-center">
                        <video ref={videoRef} autoPlay className="w-full rounded" />
                        <canvas ref={canvasRef} className="hidden" />
                        <Button
                            type="button"
                            onClick={captureFace}
                            className="mt-3 mx-auto"
                        >
                            Capturar rostro
                        </Button>
                        <Error message={errors.face_image} />
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                autoComplete="email"
                                autoFocus
                            />
                            <Error message={errors.email} />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData("remember", e.target.checked)}
                            />
                            Recordarme
                        </label>

                        <Button type="submit" disabled={processing}>
                            {processing ? "Accediendo…" : "Iniciar sesión"}
                        </Button>
                    </form>

                    {/* ⬇️ Esto es lo que querías mantener */}
                    <p className="text-center text-sm text-muted mt-5">
                        ¿No tienes cuenta?{" "}
                        <a
                            href={route("register")}
                            className="text-accent hover:underline"
                        >
                            Regístrate como jugador
                        </a>
                    </p>
                </AuthCard>
            </div>
        </>
    );
}
