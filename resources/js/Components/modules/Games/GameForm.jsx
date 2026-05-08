import Input, { Select, Textarea } from '@/Components/ui/Input';

export default function GameForm({ data, setData, errors, isEditing }) {

    const handleTitleChange = (value) => {
        setData('title', value);

        if (!isEditing) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setData('slug', slug);
        }
    };

    const handleTypeChange = (type) => {
        setData('type', type);

        if (type === 'internal') {
            setData('url', '');
        } else {
            setData('component', '');
        }
    };

    return (
        <div className="flex flex-col gap-5">

            <Input
                id="title"
                label="Título *"
                value={data.title}
                onChange={e => handleTitleChange(e.target.value)}
                error={errors.title}
                autoFocus
            />

            <Input
                id="slug"
                label="Slug"
                value={data.slug}
                disabled
                error={errors.slug}
            />

            {/* Selector de tipo */}
            <Select
                id="type"
                label="Tipo de juego *"
                value={data.type}
                onChange={e => handleTypeChange(e.target.value)}
                error={errors.type}
            >
                <option value="">— Selecciona tipo —</option>
                <option value="internal">Interno (React/Three.js)</option>
                <option value="external">Externo (URL / iframe)</option>
            </Select>

            {/* Campos condicionales */}
            {data.type === 'internal' && (
                <Input
                    id="component"
                    label="Componente interno *"
                    placeholder="Ej: SimonSaysGame"
                    value={data.component}
                    onChange={e => setData('component', e.target.value)}
                    error={errors.component}
                />
            )}

            {data.type === 'external' && (
                <Input
                    id="url"
                    label="URL del juego externo *"
                    placeholder="/games/simon-says/index.html"
                    value={data.url}
                    onChange={e => setData('url', e.target.value)}
                    error={errors.url}
                />
            )}

            <Textarea
                id="description"
                label="Descripción"
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                error={errors.description}
            />

            <Input
                id="thumbnail"
                type="file"
                label="Miniatura"
                onChange={e => setData('thumbnail', e.target.files[0])}
                error={errors.thumbnail}
            />

            <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                    type="checkbox"
                    checked={data.published}
                    onChange={e => setData('published', e.target.checked)}
                />
                Publicado
            </label>

        </div>
    );
}
