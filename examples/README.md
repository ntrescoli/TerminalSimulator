# 📚 Ejemplos de Uso

Esta carpeta contiene ejemplos de cómo usar Terminal Simulator en diferentes contextos.

## 📄 Vanilla HTML Example

**Archivo:** `vanilla.html`

Ejemplo simple en HTML puro usando Terminal Simulator sin frameworks.

### Uso:

1. **Si tienes el proyecto compilado:**
   ```bash
   # Desde la raíz del proyecto
   npm run build
   # Luego abre examples/vanilla.html en el navegador
   ```

2. **Si usas un servidor local:**
   ```bash
   # Desde la carpeta examples
   python -m http.server 8000
   # O si tienes npx
   npx http-server
   
   # Luego abre http://localhost:8000/vanilla.html
   ```

### Características:
- ✅ Sin dependencias externas (aparte del paquete)
- ✅ Estilos de ejemplo
- ✅ Totalmente funcional
- ✅ Puedes copiar este patrón a tu proyecto

---

## ⚛️ React Examples

**Archivo:** `react.tsx`

Ejemplos de cómo usar ReactTerminal en proyectos React.

### Tres variantes incluidas:

1. **BasicExample** - Uso más simple
   ```tsx
   export function BasicExample() {
     return <ReactTerminal />;
   }
   ```

2. **StyledExample** - Con estilos personalizados
   ```tsx
   <div className="custom-terminal-container">
     <ReactTerminal />
   </div>
   ```

3. **LayoutExample** - Simulando VS Code
   - Sidebar con navegación
   - Tabs para múltiples paneles
   - Layout profesional

### Cómo usarlos:

```tsx
import { BasicExample, StyledExample, LayoutExample } from './examples/react';

function App() {
  return <BasicExample />;
  // o
  return <StyledExample />;
  // o
  return <LayoutExample />;
}
```

---

## 🚀 Crear tu propio ejemplo

### Pasos:

1. **Copiar un ejemplo existente**
2. **Modificar según tus necesidades**
3. **Importar los componentes necesarios:**
   ```typescript
   import { TSTerminal, ReactTerminal, Kernel } from 'terminal-simulator';
   import 'terminal-simulator/style.css';
   ```

### Template de inicio:

**Vanilla JS:**
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/dist/style.css">
</head>
<body>
    <div id="app" style="width: 100%; height: 100vh;"></div>
    <script type="module">
        import { TSTerminal } from '/dist/terminal-simulator.js';
        new TSTerminal(document.getElementById('app'));
    </script>
</body>
</html>
```

**React:**
```tsx
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

export default function App() {
  return <ReactTerminal />;
}
```

---

## 📝 Notas

- Los ejemplos asumen que el paquete está instalado (`npm install terminal-simulator`)
- Para desarrollo local, usa `npm link` en la raíz del proyecto
- Los estilos siempre deben importarse: `import 'terminal-simulator/style.css'`
- Los ejemplos funcionan en navegadores modernos (ES2020+)

---

## 🆘 Problemas

### Error: "No se encuentra el módulo"
- Asegúrate de ejecutar `npm run build` en la raíz
- Verifica que los archivos están en `/dist/`

### Los estilos no se aplican
- Verifica que importaste el CSS
- Abre la consola del navegador para ver errores

### La terminal aparece vacía
- Abre la consola (F12) para revisar errores
- Asegúrate que el contenedor tiene dimensiones (`width` y `height`)

---

¡Diviértete creando! 🎉
