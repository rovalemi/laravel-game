import { Link } from "@inertiajs/react";

export default function Welcome() {
    return (
        <>
            <h1 className="title">Hello Alizon</h1>
            <Link href={route('logout')} method="post" as="button">
                Cerrar sesión
            </Link>
        </>
    );
}
