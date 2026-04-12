import { useForm, Head, Link } from "@inertiajs/react";
import { useEffect, useRef } from "react";

import { AuthBackground, AuthCard } from "@/Components/shared";
import { Label, Input, Error, Button } from "@/Components/ui";

export default function Register() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        face_image: "",
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
        post(route("register"));
    };

    return (
        <>
            <Head title="Registro" />

            <div className="min-h-screen flex items-center justify-center p-6 relative bg-bg text-text">
                <AuthBackground />

                <AuthCard>
                    <div className="flex items-center gap-3 mb-7">
                        <span className="text-3xl text-accent">⬡</span>
                        <span className="text-lg font-bold">GamePlatform</span>
                    </div>

                    <h1 className="text-2xl font-bold">Crear cuenta</h1>
                    <p className="text-sm text-muted mt-1 mb-7">
                        Únete como jugador y empieza a jugar
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
                        {[
                            { id: "name", label: "Nombre", type: "text", auto: "name" },
                            { id: "email", label: "Email", type: "email", auto: "email" },
                            { id: "password", label: "Contraseña", type: "password", auto: "new-password" },
                            { id: "password_confirmation", label: "Confirmar contraseña", type: "password", auto: "new-password" },
                        ].map((f) => (
                            <div key={f.id} className="flex flex-col gap-1">
                                <Label htmlFor={f.id}>{f.label}</Label>

                                <Input
                                    id={f.id}
                                    type={f.type}
                                    value={data[f.id]}
                                    onChange={(e) => setData(f.id, e.target.value)}
                                    autoComplete={f.auto}
                                />

                                <Error message={errors[f.id]} />
                            </div>
                        ))}

                        <Button type="submit" disabled={processing}>
                            {processing ? "Creando cuenta…" : "Registrarse"}
                        </Button>
                    </form>

                    {/* ⬇️ Esto también lo mantenemos */}
                    <p className="text-center text-sm text-muted mt-5">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            href={route("login")}
                            className="text-accent hover:underline"
                        >
                            Iniciar sesión
                        </Link>
                    </p>
                </AuthCard>
            </div>
        </>
    );
}
