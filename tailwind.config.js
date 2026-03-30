import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
/** @type {import('tailwindcss').Config} */

export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.jsx",
        "./resources/**/*.js",
    ],
    theme: {
        extend: {
            colors: {
                bg: "#0a0a0f",
                surface: "#12121a",
                border: "#1e1e2e",
                accent: "#7c3aed",
                accent2: "#06b6d4",
                text: "#e2e8f0",
                muted: "#64748b",
            },
        },
    },
    plugins: [],
}
