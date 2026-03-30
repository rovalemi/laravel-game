<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /** Roles del sistema */

        $admin = Role::create([
            'name' => 'administrador',
            'display_name' => 'Administrador',
            'description' => 'Control total del sistema. Gestiona usuarios y roles.',
        ]);

        $manager = Role::create([
            'name' => 'gestor',
            'display_name' => 'Gestor',
            'description' => 'Gestiona juegos: crea, edita y publica. Consulta estadísticas.',
        ]);
 
        $player = Role::create([
            'name' => 'jugador',
            'display_name' => 'Jugador',
            'description' => 'Usuario final. Accede a juegos publicados y consulta sus resultados.',
        ]);

        /** Usuario administrador por defecto */
        User::create([
            'name' => 'Admin',
            'email' => 'admin@gameplatform.local',
            'password' => Hash::make('password'),
            'role_id' => $admin->id,
        ]);

        /** Usuario gestor de prueba */
        $managerUser = User::create([
            'name' => 'Gestor Demo',
            'email' => 'gestor@gameplatform.local',
            'password' => Hash::make('password'),
            'role_id' => $manager->id,
        ]);

        /** Usuario jugador de prueba */
        User::create([
            'name' => 'Jugador Demo',
            'email' => 'jugador@gameplatform.local',
            'password' => Hash::make('password'),
            'role_id' => $player->id,
        ]);

        /** Juegos de ejemplo */
        
        Game::create([
            'title' => 'Space Explorer',
            'description' => 'Explora el espacio en un shooter 3D desarrollado con Three.js.',
            'published' => true,
            'url' => 'https://games.gameplatform.local/space-explorer',
            'created_by' => $managerUser->id,
        ]);
 
        Game::create([
            'title' => 'Maze Runner',
            'description' => 'Laberinto 3D procedural. Encuentra la salida antes de que se acabe el tiempo.',
            'published' => false, // En desarrollo, no visible para jugadores
            'url' => 'https://games.gameplatform.local/maze-runner',
            'created_by' => $managerUser->id,
        ]);
    }
}
