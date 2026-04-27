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
            'password' => Hash::make('Admin123!'),
            'role_id' => $admin->id,
        ]);

        /** Usuario gestor de prueba */
        $managerUser = User::create([
            'name' => 'Gestor Demo',
            'email' => 'gestor@gameplatform.local',
            'password' => Hash::make('Manager123!'),
            'role_id' => $manager->id,
        ]);

        /** Usuario jugador de prueba */
        User::create([
            'name' => 'Jugador Demo',
            'email' => 'jugador@gameplatform.local',
            'password' => Hash::make('Player123!'),
            'role_id' => $player->id,
        ]);

        /** Juegos de ejemplo */
        Game::updateOrCreate(
            ['slug' => 'simon-says'],
            [
                'title' => 'Simon Says',
                'slug' => 'simon-says',
                'description' => 'Juego de memoria con colores. Sigue la secuencia.',
                'component' => 'SimonSays',
                'url' => null,
                'thumbnail_path'=> null,
                'published' => true,
                'created_by' => $managerUser->id,
            ]
        );

        Game::updateOrCreate(
            ['slug' => 'memory-pulse'],
            [
                'title' => 'Memory Pulse',
                'slug' => 'memory-pulse',
                'description' => 'Juego de memoria visual. Encuentra las parejas.',
                'component' => 'MemoryPulse',
                'url' => null,
                'thumbnail_path'=> null,
                'published' => true,
                'created_by' => $managerUser->id,
            ]
        );

        Game::updateOrCreate(
            ['slug' => 'rhythm-grid'],
            [
                'title' => 'Rhythm Grid',
                'slug' => 'rhythm-grid',
                'description' => 'Juego rítmico. Toca los cuadros al ritmo.',
                'component' => 'RhythmGrid',
                'url' => null,
                'thumbnail_path'=> null,
                'published' => true,
                'created_by' => $managerUser->id,
            ]
        );

        Game::updateOrCreate(
            ['slug' => 'space-debris'],
            [
                'title' => 'Space Debris',
                'slug' => 'space-debris',
                'description' => 'Shooter 3D en el espacio. Esquiva y dispara.',
                'component' => null,
                'url' => '/games/space-debris/index.html',
                'thumbnail_path'=> null,
                'published' => true,
                'created_by' => $managerUser->id,
            ]
        );
    }
}
