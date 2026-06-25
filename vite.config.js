import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
        fs: {
            allow: [
                'D:\\PROJECTS\\TicketDot\\ticketdot-frontend',

                // 'C:\\Users\\user\\OneDrive\\Desktop\\ticketdot-frontend',
                // 'C:\\Users\\user\\.gemini\\antigravity-ide'
            ]
        }
    }
})
