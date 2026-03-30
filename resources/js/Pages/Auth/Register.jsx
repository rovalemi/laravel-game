import { AuthBackground, AuthCard } from "@/Components/shared";
import { Label, Input, Error, Button } from "@/Components/ui";
import { useForm, Head, Link } from "@inertiajs/react";

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <>
            <Head title="Registro" />

            <div className="min-h-screen flex items-center justify-center p-6 relative bg-bg text-text">

                {/* Fondo */}
                <AuthBackground />

                {/* Tarjeta */}
                <AuthCard>
                    <div className="flex items-center gap-3 mb-7">
                        <span className="text-3xl text-accent">⬡</span>
                        <span className="text-lg font-bold">GamePlatform</span>
                    </div>

                    <h1 className="text-2xl font-bold">Crear cuenta</h1>
                    <p className="text-sm text-muted mt-1 mb-7">
                        Únete como jugador y empieza a jugar
                    </p>

                    <form onSubmit={submit} className="flex flex-col gap-5">

                        {/* Campos */}
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

                        {/* Botón */}
                        <Button type="submit" disabled={processing}>
                            {processing ? "Creando cuenta…" : "Registrarse"}
                        </Button>
                    </form>

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
