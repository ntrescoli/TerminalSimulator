# Usar Terminal Simulator como Componente

Terminal Simulator puede ser embebido en otros proyectos de dos formas:

## 1. Como Dependencia NPM (Próximamente en npm registry)

### Instalación

```bash
npm install terminal-simulator
# o
pnpm add terminal-simulator
```

### Uso en TypeScript/JavaScript

```typescript
import { Kernel } from 'terminal-simulator';

// Crear una instancia del kernel
const kernel = new Kernel('/vms/default.json');

// Inicializar el sistema
await kernel.boot();

// Ejecutar comandos
const output = await kernel.execute('ls -la');
console.log(output);

// Obtener historial
const history = kernel.getHistory();
console.log(history);
```

### Uso en Vue 3

```vue
<template>
  <div class="terminal-wrapper">
    <div id="output" ref="outputRef"></div>
    <div class="input-line">
      <span id="prompt">{{ prompt }}</span>
      <input 
        type="text" 
        v-model="command"
        @keydown.enter="executeCommand"
      />
    </div>
  </div>
</template>

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
