import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            // Server only dependencies are not bundled
            external: ["nodemailer", "ics"],
        }
    },
    server: {
        proxy: {"/api": "http://localhost:3002"},
        host: true,
        port: 5173
    },
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    }
})