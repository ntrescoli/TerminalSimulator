import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // El archivo que exporta LinuxTerminal y el componente de React
      entry: resolve(__dirname, 'src/index.ts'), 
      name: 'TerminalSimulator',
      fileName: 'terminal-simulator',
    },
    rollupOptions: {
      // Nos aseguramos de no meter React dentro del paquete final
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});