import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'), 
      name: 'TerminalSimulator',
      fileName: 'terminal-simulator',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    // Asegurar que los módulos comunes se mantengan
    commonjsOptions: {
      include: [/node_modules/],
    }
  },
  // Asegurar que el JSX se transpile correctamente
  esbuild: {
    drop: undefined,
  }
});