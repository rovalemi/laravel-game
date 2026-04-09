import { Head, Link, useForm } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/shared/PageHeader';
import GameForm from '@/Components/modules/GameForm';
import Button from '@/Components/ui/Button';

export default function ManagerGamesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '', description: '', url: '', published: false, thumbnail: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('manager.games.store'), { forceFormData: true });
    };

    return (
        <AppLayout title="Nuevo juego">
            <Head title="Nuevo juego" />

            <PageHeader
                title="Crear nuevo juego"
                subtitle="Laravel gestiona los metadatos; el juego vive en su propia URL"
                action={
                    <Link href={route('manager.games.index')}>
                        <Button variant="secondary">← Volver</Button>
                    </Link>
                }
            />

            <div className="max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <GameForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    submit={submit}
                    processing={processing}
                    isEditing={false}
                />
            </div>
        </AppLayout>
    );
}
