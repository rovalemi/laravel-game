import { Link } from '@inertiajs/react';
import Input, { Textarea } from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Toggle from '@/Components/ui/Toggle';

/**
 * GameForm — formulario compartido por Create y Edit
 * El padre (Create/Edit) proporciona { data, setData, errors, submit, processing, isEditing }
 */
export default function GameForm({ data, setData, errors, submit, processing, isEditing = false }) {
    return (
        <form onSubmit={submit} encType="multipart/form-data" className="flex flex-col gap-5">

            <Input
                id="title"
                label="Título del juego *"
                value={data.title}
                onChange={e => setData('title', e.target.value)}
                placeholder="Ej: Visual Memory Game"
                error={errors.title}
                autoFocus
            />

            <Textarea
                id="description"
                label="Descripción"
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                placeholder="Describe el juego brevemente…"
                error={errors.description}
                rows={3}
            />

            <Input
                id="url"
                label="URL del juego *"
                value={data.url}
                onChange={e => setData('url', e.target.value)}
                placeholder="/games/visual-memory-game/index.html"
                hint="Ruta interna (public/games/) o URL externa (Vercel, Netlify…)"
                error={errors.url}
            />

            {/* Thumbnail */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">
                    Imagen de portada
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setData('thumbnail', e.target.files[0])}
                    className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:text-zinc-200 file:text-xs file:font-medium hover:file:bg-zinc-700 transition-colors"
                />
                {errors.thumbnail && (
                    <p className="text-xs text-red-400">{errors.thumbnail}</p>
                )}
            </div>

            <Toggle
                checked={data.published}
                onChange={v => setData('published', v)}
                label={data.published ? 'Publicado — visible para jugadores' : 'Borrador — no visible para jugadores'}
                hint="Puedes cambiar esto en cualquier momento sin tocar el código del juego"
            />

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                <Link href={route('manager.games.index')}>
                    <Button variant="secondary" as="span">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary" loading={processing}>
                    {isEditing ? 'Guardar cambios' : 'Crear juego'}
                </Button>
            </div>
        </form>
    );
}
