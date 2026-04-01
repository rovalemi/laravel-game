import Modal from '@/Components/ui/Modal';
import Button from '@/Components/ui/Button';

/**
 * ConfirmModal — modal de confirmación para acciones destructivas
 *
 * Uso:
 *   <ConfirmModal
 *     open={confirmOpen}
 *     onClose={() => setConfirmOpen(false)}
 *     onConfirm={() => router.delete(route(...))}
 *     title="Eliminar usuario"
 *     description='¿Seguro que quieres eliminar a "Juan"? Esta acción no se puede deshacer.'
 *     confirmLabel="Sí, eliminar"
 *     danger
 *   />
 */
export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title       = '¿Confirmar acción?',
    description = 'Esta acción no se puede deshacer.',
    confirmLabel = 'Confirmar',
    cancelLabel  = 'Cancelar',
    danger       = false,
    processing   = false,
}) {
    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
            <p className="text-sm text-zinc-400 mb-6">{description}</p>
            <div className="flex justify-end gap-3">
                <Button variant="secondary" size="md" onClick={onClose} disabled={processing}>
                    {cancelLabel}
                </Button>
                <Button
                    variant={danger ? 'danger' : 'primary'}
                    size="md"
                    onClick={onConfirm}
                    loading={processing}
                >
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
