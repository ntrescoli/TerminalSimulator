# Usar Terminal Simulator como Componente

Terminal Simulator puede ser embebido en otros proyectos de **dos formas principales**:

1. **TSTerminal**: Para proyectos Vanilla JS/TypeScript
2. **ReactTerminal**: Para proyectos React

---

## 📦 Instalación

### Desde npm (Próximamente)

```bash
npm install terminal-simulator
# o
pnpm add terminal-simulator
# o
yarn add terminal-simulator
```

### Desde archivo local (desarrollo)

```bash
npm install ../path/to/TerminalSimulator
```

---

## 🚀 Opción 1: Vanilla JS / TypeScript

### Uso Básico

```typescript
import { TSTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css'; // Importa los estilos

// 1. Crear un contenedor en tu HTML
const container = document.getElementById('terminal-container');

// 2. Instanciar TSTerminal
const terminal = new TSTerminal(container, '/path/to/vm-config.json');

// ✅ ¡Listo! La terminal está lista para usar
```

### Ejemplo HTML Completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Terminal</title>
    <style>
        body { margin: 0; padding: 20px; font-family: monospace; }
        #terminal-container { width: 100%; max-width: 1000px; margin: 0 auto; }
    </style>
</head>
<body>
    <div id="terminal-container"></div>

    <script type="module">
        import { TSTerminal } from './dist/terminal-simulator.js';
        import './dist/style.css';
        
        const container = document.getElementById('terminal-container');
        new TSTerminal(container);
    </script>
</body>
</html>
```

### Con Build Tool (Vite, Webpack, etc.)

```typescript
import { TSTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

// En tu código
const terminal = new TSTerminal(document.getElementById('app'));
```

---

## ⚛️ Opción 2: React

### ⚠️ Requisitos Previos

`React` y `react-dom` **NO son opcionales**. Debes instalarlos en tu proyecto:

```bash
npm install react react-dom terminal-simulator
# o
pnpm add react react-dom terminal-simulator
# o
yarn add react react-dom terminal-simulator
```

### Uso Básico

```tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';  // ← No olvides esto

export function App() {
  return (
    <div>
      <h1>Mi Aplicación con Terminal</h1>
      <ReactTerminal />
    </div>
  );
}
```

### Uso con Contenedor Personalizado

```tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export function TerminalPage() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header>
        <h1>Terminal</h1>
      </header>
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <ReactTerminal />
      </main>
    </div>
  );
}
```

### Con Next.js (App Router)

⚠️ **IMPORTANTE:** Usa `'use client'` para componentes interactivos

```tsx
'use client'; // ← Necesario para Next.js App Router

import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export default function TerminalPage() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <h1>Terminal Simulator</h1>
      <ReactTerminal />
    </div>
  );
}
```

### Con Custom Container

```tsx
import { useRef } from 'react';
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export function TerminalContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="terminal-wrapper">
      <div ref={containerRef} style={{ 
        width: '100%', 
        height: '500px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <ReactTerminal />
      </div>
    </div>
  );
}
```

---

## 🔧 Acceso Directo al Kernel (Avanzado)

Para casos más complejos, puedes acceder directamente al `Kernel`:

```typescript
import { Kernel } from 'terminal-simulator';

const kernel = new Kernel('/path/to/vm-config.json');

// Métodos disponibles
const history = kernel.getHistory();
const uptime = kernel.getUptime();

// Ejecutar comandos directamente (si está disponible)
// const result = await kernel.execute('ls -la');
```

---

## 🎨 Personalización de Estilos

Terminal Simulator usa clases CSS predefinidas. Puedes sobrescribir los estilos:

```css
/* Terminal Container */
#terminal-container {
  background-color: #1e1e1e;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 16px;
  border-radius: 8px;
}

/* Output Area */
#output {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  line-height: 1.4;
}

/* Input Line */
.input-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

#terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #00ff00;
  font-family: inherit;
  font-size: inherit;
  outline: none;
}

.prompt {
  color: #ff6b6b;
  font-weight: bold;
}
```

---

## 📝 Configuración de VM (Máquina Virtual)

Puedes pasar un archivo JSON de configuración para personalizar el estado inicial:

```typescript
new TSTerminal(container, '/vms/custom-config.json');
```

Formato del archivo JSON:

```json
{
  "hostname": "ubuntu-server",
  "users": [
    { "username": "root", "uid": 0, "home": "/root" },
    { "username": "admin", "uid": 1000, "home": "/home/admin" }
  ],
  "filesystem": {
    "directories": ["/root", "/home", "/etc", "/tmp"],
    "files": [
      { "path": "/etc/hostname", "content": "ubuntu-server" }
    ]
  }
}
```

---

## 🔌 TypeScript Support

Terminal Simulator incluye types completos:

```typescript
import { TSTerminal, Kernel, ReactTerminal } from 'terminal-simulator';

// Los tipos están disponibles automáticamente
type TerminalInstance = TSTerminal;
type KernelInstance = Kernel;
```

---

## 📚 Ejemplos Adicionales

### Crear múltiples instancias

```typescript
import { TSTerminal } from 'terminal-simulator';

// Terminal 1
const terminal1 = new TSTerminal(document.getElementById('terminal1'));

// Terminal 2 (con otra configuración)
const terminal2 = new TSTerminal(document.getElementById('terminal2'), '/vms/server.json');
```

### En un Framework MVC/MVVM

```typescript
// En tu controlador/ViewModel
class AppController {
  private terminal: TSTerminal;

  initialize(containerElement: HTMLElement) {
    this.terminal = new TSTerminal(containerElement);
  }

  getTerminal(): TSTerminal {
    return this.terminal;
  }
}
```

---

## ⚠️ Notas Importantes

1. **CSS Global**: `TSTerminal` necesita que se importe el CSS globalmente: `import 'terminal-simulator/style.css'`
2. **React DOM**: En React, el componente maneja todo internamente
3. **Contenedor**: El contenedor HTML debe tener dimensiones definidas
4. **Configuración**: Si no proporcionas URL de configuración, usa `/vms/default.json`
5. **Compatibilidad**: Requiere navegadores modernos (ES2020+)

---

## 🆘 Troubleshooting

### "Cannot find module 'terminal-simulator'"

Asegúrate de haber instalado el paquete:

```bash
npm install terminal-simulator
```

### Los estilos no se aplican

Verifica que importaste el CSS:

```typescript
import 'terminal-simulator/style.css';
```

### El contenedor se ve vacío

Asegúrate que:
1. El contenedor existe en el DOM
2. Tiene dimensiones definidas (width/height)
3. Pasaste la referencia correcta a `TSTerminal`

---

## 📖 Documentación Adicional

- [API Documentation](./API.md)
- [Guía de Comandos](./COMMANDS.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Kernel, TerminalUI } from 'terminal-simulator';

const outputRef = ref<HTMLDivElement>(null);
const command = ref('');
const prompt = ref('user@host:~$ ');

let kernel: Kernel;
let terminal: TerminalUI;

onMounted(async () => {
  kernel = new Kernel('/vms/default.json');
  await kernel.boot();

  terminal = new TerminalUI(
    outputRef.value!,
    document.createElement('input'),
    document.createElement('span')
  );

  prompt.value = kernel.getPromptText();
});

async function executeCommand() {
  if (!command.value) return;

  const output = await kernel.execute(command.value);
  terminal.print(output);
  prompt.value = kernel.getPromptText();
  command.value = '';
}
</script>
```

### Uso en React

```tsx
import React, { useRef, useEffect, useState } from 'react';
import { Kernel, TerminalUI } from 'terminal-simulator';

export const TerminalComponent: React.FC = () => {
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const [kernel, setKernel] = useState<Kernel | null>(null);

  useEffect(() => {
    const initKernel = async () => {
      const newKernel = new Kernel('/vms/default.json');
      await newKernel.boot();
      setKernel(newKernel);
    };
    initKernel();
  }, []);

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !kernel || !inputRef.current) return;

    const output = await kernel.execute(inputRef.current.value);
    console.log(output);
    inputRef.current.value = '';
  };

  return (
    <div className="terminal-container">
      <div ref={outputRef} className="output" />
      <div className="input-line">
        <span ref={promptRef} className="prompt">
          {kernel?.getPromptText()}
        </span>
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleCommand}
          autoFocus
        />
      </div>
    </div>
  );
};
```

### Uso en Angular

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Kernel, TerminalUI } from 'terminal-simulator';

@Component({
  selector: 'app-terminal',
  template: `
    <div #outputContainer class="terminal-container">
      <div #output class="output"></div>
      <div class="input-line">
        <span #prompt class="prompt"></span>
        <input 
          type="text" 
          (keydown.enter)="executeCommand($event)"
        />
      </div>
    </div>
  `,
})
export class TerminalComponent implements AfterViewInit {
  @ViewChild('output') outputRef!: ElementRef<HTMLDivElement>;
  @ViewChild('prompt') promptRef!: ElementRef<HTMLSpanElement>;

  kernel!: Kernel;

  async ngAfterViewInit() {
    this.kernel = new Kernel('/vms/default.json');
    await this.kernel.boot();
    this.promptRef.nativeElement.textContent = this.kernel.getPromptText();
  }

  async executeCommand(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (!input.value) return;

    const output = await this.kernel.execute(input.value);
    console.log(output);
    input.value = '';
  }
}
```

## 2. Como Embebido Directo (HTML + Script)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/terminal-simulator/style.css">
</head>
<body>
  <div id="terminal-container">
    <div id="output"></div>
    <div class="input-line">
      <span id="prompt" class="prompt">user@host:~$</span>
      <input type="text" id="terminal-input">
    </div>
  </div>

  <script type="module">
    import { Kernel, TerminalUI } from 'terminal-simulator';

    const kernel = new Kernel('/vms/default.json');
    await kernel.boot();

    const terminal = new TerminalUI(
      document.getElementById('output'),
      document.getElementById('terminal-input'),
      document.getElementById('prompt')
    );

    document.getElementById('terminal-input').addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const output = await kernel.execute(e.target.value);
        terminal.print(output);
        e.target.value = '';
      }
    });
  </script>
</body>
</html>
```

## Personalización

### Cambiar el Estado Inicial de la VM

```typescript
// Usar webserver.json en lugar de default.json
const kernel = new Kernel('/vms/webserver.json');

// Cargar un JSON custom
const kernel = new Kernel('/custom/myvm.json');
```

### Extender Comandos

```typescript
import { CommandRegistry } from 'terminal-simulator/kernel';

const kernel = new Kernel();
const registry = kernel.registry;

// Añadir comando personalizado
registry.register({
  name: 'hello',
  execute: async ({ args }) => {
    return `Hello ${args[0] || 'World'}!`;
  },
});

await kernel.boot();
```

## API Pública

### `Kernel`

```typescript
class Kernel {
  constructor(initialStateUrl?: string);
  
  async boot(): Promise<void>;
  async execute(input: string, skipHistory?: boolean): Promise<string>;
  getPromptText(): string;
  getHistory(): string[];
  getUptime(): number;
  exportFullSystemState(): any;
}
```

### `TerminalUI`

```typescript
class TerminalUI {
  constructor(
    outputElement: HTMLElement,
    inputElement: HTMLInputElement,
    promptElement: HTMLElement
  );
  
  print(text: string, className?: string): void;
  clear(): void;
  updatePrompt(text: string): void;
}
```

## Problemas Comunes

### "Cannot find module 'terminal-simulator'"

Asegúrate de que:
- `terminal-simulator` está instalado: `npm install terminal-simulator`
- Estás usando un bundler compatible (Vite, Webpack, etc.)
- Tu `tsconfig.json` tiene `"moduleResolution": "node"`

### Estilos no se aplican

Importa el CSS:

```typescript
import 'terminal-simulator/styles';
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, lee [CONTRIBUTING.md](../docs/CONTRIBUTING.md) antes de hacer cambios.
