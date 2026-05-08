import { useForm } from '@inertiajs/react';

import GameForm from './GameForm';
import Button from '@/Components/ui/Button';

export default function GameEditModal({ game, onClose }) {

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: game.title,
        slug: game.slug,
        type: game.component ? 'internal' : 'external',
        component: game.component ?? '',
        url: game.url ?? '',
        description: game.description ?? '',
        thumbnail: null,
        published: game.published,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('manager.games.update', game.slug), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">Editar juego</h2>
            <p className="text-sm text-zinc-400 mb-6">
                Modifica los datos del juego seleccionado.
            </p>

            <form onSubmit={submit} className="space-y-6">
                <GameForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    isEditing={true}
                />

                <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={processing}>
                        Guardar cambios
                    </Button>
                </div>
            </form>
        </div>
    );
}
