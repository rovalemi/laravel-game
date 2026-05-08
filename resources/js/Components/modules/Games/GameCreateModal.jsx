import { useForm } from '@inertiajs/react';

import GameForm from '@/Components/modules/Games/GameForm';
import Button from '@/Components/ui/Button';

export default function GameCreateModal({ onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        type: '',
        component: '',
        url: '',
        description: '',
        thumbnail: null,
        published: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('manager.games.store'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">Nuevo juego</h2>
            <p className="text-sm text-zinc-400 mb-6">
                Agregar juegos internos o externos.
            </p>

            <form onSubmit={submit} className="space-y-6">
                <GameForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    isEditing={false}
                />

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={processing}>Crear juego</Button>
                </div>
            </form>
        </div>
    );
}
