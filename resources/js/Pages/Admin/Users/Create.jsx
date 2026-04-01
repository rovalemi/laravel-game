export default function AdminUsersCreate({ roles, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', email: '', password: '', password_confirmation: '', role_id: '',
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
            <p className="text-sm text-muted mb-6">
                El administrador puede crear usuarios con cualquier rol
            </p>

            <UserForm
                data={data}
                setData={setData}
                errors={errors}
                submit={submit}
                processing={processing}
                roles={roles}
                isEditing={false}
            />

            <button
                onClick={onClose}
                className="mt-4 text-sm text-accent hover:underline"
            >
                Cancelar
            </button>
        </div>
    );
}
