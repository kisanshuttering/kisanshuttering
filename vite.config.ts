import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          materials: path.resolve(__dirname, 'materials.html'),
          'scaffolding-rental-gurgaon': path.resolve(__dirname, 'scaffolding-rental-gurgaon.html'),
          'scaffolding-rental-manesar': path.resolve(__dirname, 'scaffolding-rental-manesar.html'),
          'scaffolding-rental-noida': path.resolve(__dirname, 'scaffolding-rental-noida.html'),
          'scaffolding-rental-greater-noida': path.resolve(__dirname, 'scaffolding-rental-greater-noida.html'),
          'scaffolding-rental-bangalore': path.resolve(__dirname, 'scaffolding-rental-bangalore.html'),
          'scaffolding-rental-whitefield': path.resolve(__dirname, 'scaffolding-rental-whitefield.html'),
          'scaffolding-rental-chennai': path.resolve(__dirname, 'scaffolding-rental-chennai.html'),
          'scaffolding-rental-guindy': path.resolve(__dirname, 'scaffolding-rental-guindy.html'),
          'scaffolding-rental-hyderabad': path.resolve(__dirname, 'scaffolding-rental-hyderabad.html'),
          'scaffolding-rental-gachibowli': path.resolve(__dirname, 'scaffolding-rental-gachibowli.html'),
          'scaffolding-rental-coimbatore': path.resolve(__dirname, 'scaffolding-rental-coimbatore.html'),
          'scaffolding-rental-saravanampatti': path.resolve(__dirname, 'scaffolding-rental-saravanampatti.html'),
          admin: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
  };
});
