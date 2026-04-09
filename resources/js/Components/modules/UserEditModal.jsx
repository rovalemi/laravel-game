import { useForm } from '@inertiajs/react';

import UserForm from '@/Components/modules/UserForm';
import Button from '@/Components/ui/Button';

export default function UserEditModal({ user, onClose, roles }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role_id: user.role_id,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">Editar usuario</h2>
            <p className="text-sm text-zinc-400 mb-6">
                Modifica los datos del usuario seleccionado.
            </p>

            <form onSubmit={submit} className="space-y-6">
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    roles={roles}
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
