import { Head, usePage, router, Link } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, ConfirmModal } from '@/Components/shared';
import UserRow from '@/Components/modules/UserRow';
import { Pagination, EmptyState, Button } from '@/Components/ui';
import UserCreateModal from '@/Components/modules/UserCreateModal';

export default function AdminUsersIndex({ users, roles }) {
    const { auth } = usePage().props;
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('admin.users.destroy', toDelete.id), {
            onFinish: () => { setDeleting(false); setToDelete(null); },
        });
    };

    return (
        <AppLayout title="Usuarios">
            <Head title="Gestión de usuarios" />

            <PageHeader
                title="Usuarios del sistema"
                subtitle={`${users.total} usuario${users.total !== 1 ? 's' : ''} registrados`}
                action={
                    <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
                        + Nuevo usuario
                    </Button>
                }
            />

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <UserCreateModal
                        roles={roles}
                        onClose={() => setShowCreateModal(false)}
                    />
                </div>
            )}

            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <UserEditModal
                        user={editingUser}
                        roles={roles}
                        onClose={() => setEditingUser(null)}
                    />
                </div>
            )}

            {users.data.length === 0 ? (
                <EmptyState
                    icon="◉"
                    title="Sin usuarios"
                    description="Crea el primer usuario del sistema."
                    action={
                        <Link href={route('admin.users.create')}>
                            <Button variant="primary" size="md">+ Nuevo usuario</Button>
                        </Link>
                    }
                />
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Registrado
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map(user => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    currentUserId={auth.user.id}
                                    onDeleteRequest={setToDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination links={users.links} />

            <ConfirmModal
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={handleDelete}
                title="Eliminar usuario"
                description={`¿Seguro que quieres eliminar a "${toDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                processing={deleting}
                danger
            />
        </AppLayout>
    );
}
