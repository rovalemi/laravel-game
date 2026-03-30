import { AuthBackground, AuthCard } from "@/Components/shared";
import { Label, Input, Error, Button } from "@/Components/ui";
import { useForm, Head } from "@inertiajs/react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
 
    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div className="min-h-screen flex items-center justify-center p-6 relative bg-bg text-text">

                {/* Fondo */}
                <AuthBackground />

                {/* Tarjeta */}
                <AuthCard>
                    <div className="flex items-center gap-3 mb-7">
                        <span className="text-3xl text-accent">⬡</span>
                        <span className="text-lg font-bold">GamePlatform</span>
                    </div>

                    <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
                    <p className="text-sm text-muted mt-1 mb-7">
                        Accede a tu cuenta para continuar
                    </p>

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
