import Input, { Select } from '@/Components/ui/Input';

export default function UserForm({ data, setData, errors, roles, isEditing = false }) {
    return (
        <div className="flex flex-col gap-5">

            <Input
                id="name"
                label="Nombre completo *"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                placeholder="Ej: María García"
                error={errors.name}
                autoFocus
            />

            <Input
                id="email"
                label="Email *"
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                placeholder="usuario@ejemplo.com"
                error={errors.email}
            />

            {/* Contraseña solo en creación */}
            {!isEditing && (
                <>
                    <Input
                        id="password"
                        label="Contraseña *"
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password}
                    />

                    <Input
                        id="password_confirmation"
                        label="Confirmar contraseña *"
                        type="password"
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                    />
                </>
            )}

            <Select
                id="role_id"
                label="Rol *"
                value={data.role_id}
                onChange={e => setData('role_id', e.target.value)}
                error={errors.role_id}
            >
                <option value="">— Selecciona un rol —</option>
                {roles.map(role => (
                    <option key={role.id} value={role.id}>
                        {role.display_name}
                    </option>
                ))}
            </Select>
        </div>
    );
}
