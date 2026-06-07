# 📦 Usar Terminal Simulator como Paquete NPM

Esta guía te muestra cómo instalar y usar Terminal Simulator en tus proyectos.

## Instalación Rápida

```bash
npm install terminal-simulator
# o
pnpm add terminal-simulator
# o
yarn add terminal-simulator
```

---

## 🚀 2 Formas de Usar

### Opción 1️⃣: Vanilla JavaScript/TypeScript

Perfecto para proyectos sin frameworks o con cualquier framework que no sea React.

**Instalación de dependencias:**

```bash
npm install terminal-simulator
```

**Uso en tu código:**

```typescript
import { TSTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

// Selecciona el contenedor donde irá la terminal
const container = document.getElementById('my-terminal');

// Crea la instancia
const terminal = new TSTerminal(container);

// ✅ ¡Listo! La terminal está funcionando
```

**HTML mínimo:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Terminal</title>
</head>
<body>
    <div id="my-terminal" style="width: 100%; height: 600px;"></div>

    <script type="module">
        import { TSTerminal } from 'terminal-simulator';
        import 'terminal-simulator/style.css';
        
        new TSTerminal(document.getElementById('my-terminal'));
    </script>
</body>
</html>
```

---

### Opción 2️⃣: React

Para proyectos React, es más simple aún.

**Instalación:**

```bash
npm install terminal-simulator react react-dom
# o con pnpm
pnpm add terminal-simulator react react-dom
```

⚠️ **IMPORTANTE:** `react` y `react-dom` deben estar instalados en tu proyecto.

**Uso en tu componente:**

```tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export function MyApp() {
  return (
    <div>
      <h1>Mi Terminal</h1>
      <ReactTerminal />
    </div>
  );
}
```

**Ejemplo con Next.js 13+:**

```tsx
'use client'; // ← IMPORTANTE: Necesario en Next.js App Router

import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export default function Page() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
      <ReactTerminal />
    </div>
  );
}
```

---

## 🎨 Estilos y Personalización

### Importar CSS

El paquete viene con estilos por defecto. Importa siempre el CSS:

```javascript
import 'terminal-simulator/style.css';
```

### Personalizar estilos

Crea tus propios estilos después de importar los del paquete:

```css
/* Tus estilos personalizados */
#terminal-container {
  background-color: #000;
  color: #0f0;
  font-size: 16px;
  border-radius: 8px;
  padding: 16px;
}

#terminal-input {
  color: #0f0;
}

.prompt {
  color: #f00;
}
```

---

## 🔧 Acceso al Kernel (Avanzado)

Para casos avanzados, puedes importar el Kernel directamente:

```typescript
import { Kernel } from 'terminal-simulator';

const kernel = new Kernel('/vms/default.json');

// Métodos disponibles
const history = kernel.getHistory();
const uptime = kernel.getUptime();
```

---

## 📁 Proyectos de Ejemplo

### Vite + Vanilla TS

```bash
npm create vite@latest my-terminal -- --template vanilla
cd my-terminal
npm install terminal-simulator
```

**main.ts:**

```typescript
import { TSTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

new TSTerminal(document.getElementById('app')!);
```

**index.html:**

```html
<div id="app" style="width: 100vw; height: 100vh;"></div>
```

### Create React App

```bash
npx create-react-app my-terminal-app
cd my-terminal-app
npm install terminal-simulator
```

**App.tsx:**

```tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactTerminal />
    </div>
  );
}

export default App;
```

---

## 🌐 Usar desde CDN (Vanilla JS)

También puedes usar Terminal Simulator directamente desde un CDN (cuando esté publicado):

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/terminal-simulator/dist/style.css">
</head>
<body>
    <div id="terminal" style="width: 100%; height: 600px;"></div>

    <script type="module">
        import { TSTerminal } from 'https://unpkg.com/terminal-simulator/dist/terminal-simulator.js';
        
        new TSTerminal(document.getElementById('terminal'));
    </script>
</body>
</html>
```

---

## ✅ Checklist para Usar como Paquete

- [ ] Ejecutar `npm install terminal-simulator`
- [ ] Para React: Instalar `react` y `react-dom` también
- [ ] Importar `TSTerminal` o `ReactTerminal`
- [ ] Importar el CSS: `import 'terminal-simulator/style.css'`
- [ ] Proporcionar un contenedor HTML con dimensiones
- [ ] Verificar que los estilos se aplican correctamente

---

## 🆘 Solución de Problemas

### Error: "Cannot read properties of undefined (reading 'ReactCurrentDispatcher')"

**Causa:** React no está instalado en tu proyecto.

**Solución:**
```bash
# Debes instalar React y react-dom
npm install react react-dom

# Si usas pnpm
pnpm add react react-dom

# Si usas yarn
yarn add react react-dom
```

Verifica en tu `package.json`:
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "terminal-simulator": "^1.0.0"
  }
}
```

### Error: "The file is in the MIME type application/json"

**Causa:** Falta importar el CSS.

**Solución:**
```typescript
import 'terminal-simulator/style.css'; // ← Agrega esto
import { TSTerminal } from 'terminal-simulator';
```

### La terminal no se ve

1. Verifica que importaste el CSS
2. Asegúrate que el contenedor tiene `width` y `height` definidas
3. Revisa la consola del navegador para errores

### Los estilos no se aplican

Importa el CSS **antes** de cualquier otro CSS:

```typescript
import 'terminal-simulator/style.css'; // ← Primero
import './my-styles.css'; // ← Después
```

### Con Next.js: "useRef is not defined"

**Causa:** Usas un Client Component en Next.js.

**Solución:** Agrega `'use client'` al inicio del archivo:

```tsx
'use client'; // ← IMPORTANTE

import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export default function Page() {
  return <ReactTerminal />;
}
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

- [EMBEDDING.md](./docs/EMBEDDING.md) - Documentación de integración completa
- [API.md](./docs/API.md) - Referencia de API
- [COMMANDS.md](./docs/COMMANDS.md) - Lista de comandos disponibles
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Solución de problemas

---

## 📝 Build y Deploy

Si quieres usar una versión local durante desarrollo:

```bash
# En el proyecto terminal-simulator
npm run build

# En tu proyecto
npm install ../path/to/terminal-simulator
```

---

**¡Listo para usar! 🎉**
