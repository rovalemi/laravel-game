import { Modal, Button } from '@/Components/ui';

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
