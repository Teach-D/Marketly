import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/products': 'http://localhost:3000',
      '/carts': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/reviews': 'http://localhost:3000',
    },
  },
});
