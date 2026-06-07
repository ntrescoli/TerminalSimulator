import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts'; // 1. Importa el plugin
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
dts({ 
  insertTypesEntry: true,
  include: ['src'],            // Asegura procesar SOLO la carpeta src
  exclude: ['src/main.ts', 'scripts/**/*', 'tests/**/*'], // Evita que se cuelen archivos de ejecución o test
  rollupTypes: true,           // Unifica todo en index.d.ts
  bundledPackages: [],         // Forzamos un bundling limpio de dependencias locales
  compilerOptions: {
    noEmit: false,             // Sobrescribimos el noEmit del tsconfig temporalmente para el plugin
    declaration: true,
    emitDeclarationOnly: true
  }
})
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TerminalSimulator',
      fileName: (format) => `terminal-simulator.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});