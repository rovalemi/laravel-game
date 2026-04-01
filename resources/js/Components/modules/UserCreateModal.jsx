import UserForm from '@/Components/modules/UserForm';
import Button from '@/Components/ui/Button';
import { useForm } from '@inertiajs/react';

export default function UserCreateModal({ onClose, roles }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">Crear usuario</h2>
            <p className="text-sm text-zinc-400 mb-6">
                El administrador puede crear usuarios con cualquier rol.
            </p>

            <form onSubmit={submit} className="space-y-6">
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    roles={roles}
                    isEditing={false}
                />

                <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={processing}>
                        Crear usuario
                    </Button>
                </div>
            </form>
        </div>
    );
}
