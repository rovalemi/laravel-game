<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestión de usuarios - solo accesible por administrador.
 * El admin puede crear, editar y asignar roles a cualquier usuario.
 * No puede eliminar su propia cuenta.
 */
class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('role')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => Role::all(),
        ]);
    }
}
