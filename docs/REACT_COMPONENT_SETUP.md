# 🐛 Solución: Usar ReactTerminal en Otros Proyectos

Si obtienes este error:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'ReactCurrentDispatcher')
```

**Solución:** Asegúrate de instalar correctamente React y react-dom.

---

## ✅ Pasos Correctos

### 1. Instalar el Paquete Y React

```bash
npm install terminal-simulator react react-dom
# o con pnpm
pnpm add terminal-simulator react react-dom
```

⚠️ **IMPORTANTE:** `react` y `react-dom` son **peerDependencies** - debes instalarlos en tu proyecto.

### 2. Importar en tu Componente

```tsx
// App.tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';  // ← No olvides esto

export function App() {
  return <ReactTerminal />;
}
```

### 3. Asegurar que React está configurado

Si usas **Create React App** o **Vite con React**, ya está configurado.

Si usas **Vite sin template React**, asegúrate que tienes:

**vite.config.ts:**
```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
});
```

**package.json:**
```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

---

## 🎯 Ejemplos por Framework

### Create React App

```bash
npx create-react-app my-app
cd my-app
npm install terminal-simulator
```

**src/App.jsx:**
```jsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

function App() {
  return <ReactTerminal />;
}

export default App;
```

### Vite + React

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm install terminal-simulator
```

**src/App.tsx:**
```tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export function App() {
  return <ReactTerminal />;
}
```

### Next.js 13+ (App Router)

```bash
npx create-next-app@latest my-app
cd my-app
npm install terminal-simulator
```

**app/page.tsx:**
```tsx
'use client';  // ← IMPORTANTE: Necesita Client Component

import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export default function Home() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactTerminal />
    </div>
  );
}
```

### Next.js 13+ (Pages Router)

```tsx
// pages/terminal.tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export default function TerminalPage() {
  return <ReactTerminal />;
}
```

---

## 🚀 Si Aún Hay Errores

### Error: "Cannot read properties of undefined"

**Causa:** React no está en el scope.

**Solución:**
```tsx
// ❌ Malo - React no está importado
export default function App() {
  return <ReactTerminal />;  // ← Falla
}

// ✅ Bueno - React está disponible
import React from 'react';  // ← Importa React explícitamente si lo necesitas
import { ReactTerminal } from 'terminal-simulator';

export default function App() {
  return <ReactTerminal />;  // ← Funciona
}
```

### Error: "jsx is not defined"

**Causa:** JSX no está transpilado correctamente.

**Solución:** Asegúrate de usar `.tsx` (no `.ts`) para archivos con JSX.

### Error: "style.css not found"

**Causa:** Los estilos no se importan.

**Solución:**
```tsx
// ✅ Correcto
import 'terminal-simulator/style.css';
import { ReactTerminal } from 'terminal-simulator';
```

### Error: "terminal-simulator/style.css" no se encuentra

**Causa:** Puede ser un problema de path en Next.js.

**Solución:** Intenta:
```tsx
import 'terminal-simulator/dist/style.css';
```

---

## 📋 Checklist de Instalación

- [ ] Instalé `terminal-simulator`
- [ ] Instalé `react` y `react-dom` (no son opcionales)
- [ ] Estoy usando archivo `.tsx` (no `.ts`) si tengo JSX
- [ ] Importé `'terminal-simulator/style.css'`
- [ ] Mi proyecto tiene React configurado (Vite plugin, CRA, Next, etc.)
- [ ] Estoy en un Client Component (Next.js: `'use client'`)
- [ ] Ejecuté `npm install` después de cambios

---

## 🔍 Debug: Verificar que todo está bien

En tu navegador console, ejecuta:

```javascript
// Debe mostrar true
console.log(typeof React !== 'undefined');
console.log(typeof ReactDOM !== 'undefined');

// Intenta acceder a terminal-simulator
import('terminal-simulator').then(m => {
  console.log('ReactTerminal:', m.ReactTerminal);
  console.log('TSTerminal:', m.TSTerminal);
});
```

---

## 📞 ¿Aún no funciona?

1. **Limpia cache:**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **Rebuild:**
   ```bash
   pnpm build (en terminal-simulator)
   npm run dev (en tu proyecto)
   ```

3. **Verifica versiones:**
   ```bash
   npm list react react-dom terminal-simulator
   ```

4. **Intenta con la versión local:**
   ```bash
   npm install /ruta/a/terminal-simulator
   ```

---

**¡Debería funcionar ahora! 🎉**
