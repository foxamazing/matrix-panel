
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true, // Fail if 3000 is taken (so script can handle it)
        proxy: {
            '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:3002',
                changeOrigin: true,
            },
            '/favicon.ico': {
                target: 'http://localhost:3002',
                changeOrigin: true,
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
