/**
 * Registro de juegos internos.
 *
 * IMPORTANTE:
 * - La clave debe coincidir EXACTAMENTE con el valor guardado en `game.component`
 * - El archivo debe existir en: /resources/js/Pages/Games/<Componente>.jsx
 * - Cada entrada usa import() para carga dinámica compatible con Vite
 */

export const internalGames = {

    SimonSays: () => import('./SimonSays.jsx'),
    RhythmGrid: () => import('./RhythmGrid.jsx'),
    MemoryPulse: () => import('./MemoryPulse.jsx'),
};
