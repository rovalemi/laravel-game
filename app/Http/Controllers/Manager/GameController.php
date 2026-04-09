<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

    public function create(): Response
    {
        return Inertia::render('Manager/Games/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'url' => ['required', 'string', 'max:500'],
            'published' => ['boolean'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        Game::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'url' => $validated['url'],
            'published' => $validated['published'] ?? false,
            'thumbnail_path' => $thumbnailPath,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('manager.games.index')->with('success', 'Juego creado correctamente.');
    }

    public function edit(Game $game): Response
    {
        return Inertia::render('Manager/Games/Edit', ['game' => $game->load('creator')]);
    }

    public function update(Request $request, Game $game): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'url' => ['required', 'string', 'max:500'],
            'published' => ['boolean'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($game->thumbnail_path) {
                Storage::disk('public')->delete($game->thumbnail_path);
            }
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $game->update([
            'title'          => $validated['title'],
            'description'    => $validated['description'] ?? null,
            'url'            => $validated['url'],
            'published'      => $validated['published'] ?? false,
            'thumbnail_path' => $validated['thumbnail_path'] ?? $game->thumbnail_path,
        ]);

        return redirect()->route('manager.games.index')->with('success', 'Juego actualizado.');
    }

    public function togglePublish(Game $game): RedirectResponse
    {
        $game->update(['published' => ! $game->published]);

        $message = $game->published ? 'Juego publicado.' : 'Juego despublicado.';

        return back()->with('success', $message);
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
