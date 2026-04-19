import { useForm, Head } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

import { AuthBackground, AuthCard } from "@/Components/shared";
import { Label, Input, Error, Button } from "@/Components/ui";

export default function Login() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [showCamera, setShowCamera] = useState(false);
    const [captured, setCaptured] = useState(false);
    const [facialAvailable, setFacialAvailable] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        face_image: "",
        remember: false,
    });

    // Consultar estado del microservicio
    useEffect(() => {
        fetch("/facial/status")
            .then((r) => r.json())
            .then((data) => setFacialAvailable(data.available));
    }, []);

    const enableCamera = async () => {
        setShowCamera(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) stream.getTracks().forEach((t) => t.stop());
    };

    const captureFace = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const base64 = canvas.toDataURL("image/jpeg");
        setData("face_image", base64);

        setCaptured(true);
        stopCamera();
    };

    const submit = (e) => {
        e.preventDefault();
        stopCamera();
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

                    {/* Aviso si el servicio está caído */}
                    {!facialAvailable && (
                        <p className="text-center text-warning mb-4">
                            La verificación facial no está disponible en este momento.
                        </p>
                    )}

                    {/* Botón para activar cámara */}
                    {facialAvailable && !showCamera && (
                        <div className="flex justify-center mb-4">
                            <Button type="button" onClick={enableCamera}>
                                Usar verificación facial (opcional)
                            </Button>
                        </div>
                    )}

                    {/* Cámara */}
                    {showCamera && (
                        <div className="mb-4 flex flex-col items-center">
                            <video ref={videoRef} autoPlay className="w-full rounded" />
                            <canvas ref={canvasRef} className="hidden" />

                            <Button
                                type="button"
                                onClick={captureFace}
                                className="mt-3"
                            >
                                {captured ? "Rostro capturado ✔" : "Capturar rostro"}
                            </Button>

                            <Error message={errors.face_image} />
                        </div>
                    )}

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

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                autoComplete="current-password"
                            />
                            <Error message={errors.password} />
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
