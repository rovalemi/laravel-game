import { Head, Link, useForm } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/shared/PageHeader';
import GameForm from '@/Components/modules/GameForm';
import { Badge, Button } from '@/Components/ui';

export default function ManagerGamesEdit({ game }) {
    const { data, setData, post, processing, errors } = useForm({
        title: game.title,
        description: game.description ?? '',
        url: game.url,
        published: game.published,
        thumbnail: null,
        _method: 'PUT',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('manager.games.update', game.id), { forceFormData: true });
    };

    return (
        <AppLayout title="Editar juego">
            <Head title={`Editar: ${game.title}`} />

            <PageHeader
                title={`Editando: ${game.title}`}
                subtitle={`ID #${game.id}`}
                action={
                    <div className="flex items-center gap-3">
                        <Badge variant={game.published ? 'green' : 'gray'}>
                            {game.published ? 'Publicado' : 'Borrador'}
                        </Badge>
                        <Link href={route('manager.games.index')}>
                            <Button variant="secondary">← Volver</Button>
                        </Link>
                    </div>
                }
            />

            <div className="max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <GameForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    submit={submit}
                    processing={processing}
                    isEditing={true}
                />
            </div>
        </AppLayout>
    );
}
