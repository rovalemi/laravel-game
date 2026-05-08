<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    public function index(): Response
    {
        $games = Game::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Manager/Games/Index', ['games' => $games]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'slug'        => ['required', 'string', 'max:255', 'unique:games,slug'],
            'type'        => ['required', 'in:internal,external'],
            'component'   => ['nullable', 'required_if:type,internal', 'string', 'max:255'],
            'url'         => ['nullable', 'required_if:type,external', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:2000'],
            'published'   => ['boolean'],
            'thumbnail'   => ['nullable', 'image', 'max:2048'],
        ]);

        // Normalizar slug
        $validated['slug'] = Str::slug($validated['slug']);

        // Limpiar campos según tipo
        if ($validated['type'] === 'internal') {
            $validated['url'] = null;
        } else {
            $validated['component'] = null;
        }

        // Guardar thumbnail
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        Game::create([
            'title'          => $validated['title'],
            'slug'           => $validated['slug'],
            'component'      => $validated['component'],
            'url'            => $validated['url'],
            'description'    => $validated['description'] ?? null,
            'published'      => $validated['published'] ?? false,
            'thumbnail_path' => $thumbnailPath,
            'created_by'     => Auth::id(),
        ]);

        return redirect()->route('manager.games.index')->with('success', 'Juego creado correctamente.');
    }

    public function update(Request $request, Game $game): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'slug'        => ['required', 'string', 'max:255', 'unique:games,slug,' . $game->id],
            'type'        => ['required', 'in:internal,external'],
            'component'   => ['nullable', 'required_if:type,internal', 'string', 'max:255'],
            'url'         => ['nullable', 'required_if:type,external', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:2000'],
            'published'   => ['boolean'],
            'thumbnail'   => ['nullable', 'image', 'max:2048'],
        ]);

        // Normalizar slug
        $validated['slug'] = Str::slug($validated['slug']);

        // Limpiar campos según tipo
        if ($validated['type'] === 'internal') {
            $validated['url'] = null;
        } else {
            $validated['component'] = null;
        }

        // Thumbnail
        if ($request->hasFile('thumbnail')) {
            if ($game->thumbnail_path) {
                Storage::disk('public')->delete($game->thumbnail_path);
            }
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $game->update([
            'title'          => $validated['title'],
            'slug'           => $validated['slug'],
            'component'      => $validated['component'],
            'url'            => $validated['url'],
            'description'    => $validated['description'] ?? null,
            'published'      => $validated['published'] ?? false,
            'thumbnail_path' => $validated['thumbnail_path'] ?? $game->thumbnail_path,
        ]);

        return redirect()->route('manager.games.index')->with('success', 'Juego actualizado.');
    }

    public function togglePublish(Game $game): RedirectResponse
    {
        $game->update(['published' => ! $game->published]);

        return back()->with('success', $game->published ? 'Juego publicado.' : 'Juego despublicado.');
    }

    public function destroy(Game $game): RedirectResponse
    {
        $game->delete();

        return redirect()->route('manager.games.index')->with('success', 'Juego eliminado.');
    }

    public function preview(Game $game): Response
    {
        return Inertia::render('Manager/Games/Preview', ['game' => $game]);
    }
}
