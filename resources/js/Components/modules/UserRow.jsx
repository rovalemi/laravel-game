import { Link } from '@inertiajs/react';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';

/**
 * UserRow — fila de usuario para la tabla del admin
 * El borrado usa ConfirmModal del padre (no window.confirm)
 */

const roleBadge = {
    administrador: 'violet',
    gestor:        'blue',
    jugador:       'gray',
};

export default function UserRow({ user, currentUserId, onDeleteRequest }) {
    const isCurrentUser = user.id === currentUserId;

    return (
        <tr className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
            {/* Avatar + nombre */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.name[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-100">
                            {user.name}
                            {isCurrentUser && (
                                <span className="ml-2 text-xs text-zinc-600">(tú)</span>
                            )}
                        </p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                </div>
            </td>

            {/* Rol */}
            <td className="px-5 py-3">
                <Badge variant={roleBadge[user.role?.name] ?? 'gray'}>
                    {user.role?.display_name ?? user.role?.name}
                </Badge>
            </td>

            {/* Fecha */}
            <td className="px-5 py-3 text-xs text-zinc-500">
                {new Date(user.created_at).toLocaleDateString('es-ES')}
            </td>

            {/* Acciones */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-2 justify-end">
                    <Link href={route('admin.users.edit', user.id)}>
                        <Button size="sm" variant="secondary">Editar</Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="danger"
                        disabled={isCurrentUser}
                        onClick={() => onDeleteRequest(user)}
                    >
                        Eliminar
                    </Button>
                </div>
            </td>
        </tr>
    );
}
