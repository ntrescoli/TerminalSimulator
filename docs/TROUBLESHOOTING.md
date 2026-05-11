# Solución de Problemas

Guía para resolver problemas comunes con Terminal Simulator.

## Tabla de Contenidos

- [Problemas de Instalación](#problemas-de-instalación)
- [Problemas de Ejecución](#problemas-de-ejecución)
- [Problemas de Comandos](#problemas-de-comandos)
- [Problemas de Compilación](#problemas-de-compilación)
- [Problemas de Navegador](#problemas-de-navegador)

---

## Problemas de Instalación

### Error: "pnpm: command not found"

**Problema**: pnpm no está instalado.

**Solución**:
```bash
# Instalar pnpm globalmente
npm install -g pnpm

# O usar npm directamente en su lugar
npm install
npm run dev
```

---

### Error: "npm ERR! 404 Not Found"

**Problema**: Error descargando dependencias.

**Solución**:
```bash
# Limpiar caché
pnpm store prune

# Reintentar
pnpm install
```

---

### Error: "git: command not found"

**Problema**: Git no está instalado.

**Solución**:
- **Windows**: Descargar de https://git-scm.com/download/win
- **macOS**: `brew install git`
- **Linux**: `sudo apt-get install git`

---

## Problemas de Ejecución

### El servidor no inicia

**Síntomas**:
- El terminal no muestra "Local: http://localhost:5173"
- Error: "EADDRINUSE: address already in use"

**Solución**:
```bash
# Ver qué proceso usa el puerto 5173
# Windows:
netstat -ano | findstr :5173

# macOS/Linux:
lsof -i :5173

# Matar el proceso:
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>

# Reiniciar el servidor
pnpm dev
```

---

### Error: "Cannot find module '@...'"

**Problema**: Dependencias no instaladas correctamente.

**Solución**:
```bash
# Eliminar carpetas de caché
rm -rf node_modules
rm -rf pnpm-lock.yaml  # o package-lock.json

# Reinstalar
pnpm install

# Reiniciar servidor
pnpm dev
```

---

### El navegador muestra página en blanco

**Problema**: La aplicación no carga en el navegador.

**Solución**:
1. Abre la consola del navegador (F12)
2. Revisa la pestaña "Console" para errores
3. Comprueba la pestaña "Network" para solicitudes fallidas
4. Intenta:
   ```bash
   # Limpiar build
   pnpm build
   
   # Reiniciar dev server
   pnpm dev
   ```

---

## Problemas de Comandos

### Comando no encontrado

**Síntoma**: `bash: comando: command not found`

**Soluciones**:
1. Verifica que el comando esté soportado: `help`
2. Comprueba la ortografía del comando
3. Algunos comandos requieren argumentos específicos

```bash
# Verificar comandos disponibles
$ help

# Ver sintaxis del comando
$ help nombrecomando
```

---

### El comando devuelve resultado inesperado

**Ejemplos**:
- `ls` no muestra directorios
- `grep` no encuentra coincidencias
- `cat` muestra contenido vacío

**Soluciones**:
```bash
# Verificar directorio actual
$ pwd

# Verificar si la ruta existe
$ ls /ruta/a/verificar

# Ver contenido del archivo
$ cat archivo.txt

# Buscar con opciones
$ grep -i "patrón" archivo.txt
```

---

### Error de permisos "Permission denied"

**Síntoma**:
```
bash: archivo: Permission denied
```

**Soluciones**:
```bash
# Ver permisos del archivo
$ ls -la archivo.txt

# Cambiar permisos
$ chmod 644 archivo.txt    # Lectura/escritura
$ chmod 755 archivo.txt    # Ejecutable

# Cambiar propietario (requiere sudo)
$ sudo chown usuario archivo.txt
```

---

### El historial no se guarda

**Síntoma**: Los comandos anteriores desaparecen al refrescar.

**Nota**: Terminal Simulator usa historial de sesión. Se reinicia con:
- Refresco de página (F5)
- Cerrar y reabrir el navegador
- Configuración por defecto (sin persistencia a base de datos)

---

## Problemas de Compilación

### Error: "tsc: command not found"

**Problema**: TypeScript no está instalado globalmente.

**Solución**:
```bash
# TypeScript se incluye en dependencias locales
pnpm install

# Usar la versión local
pnpm run build
```

---

### Error de compilación TypeScript

**Síntomas**:
```
error TS2322: Type 'X' is not assignable to type 'Y'
```

**Soluciones**:
1. Verifica los tipos en `src/types/types.ts`
2. Asegúrate que las interfaces coinciden
3. Ejecuta:
   ```bash
   # Verificar errores
   pnpm build
   
   # Si hay errores, revisa el mensaje
   # y corrige el código
   ```

---

### Advertencias en consola durante compilación

**Información**: Warnings (amarillos) son alertas, no errores.

**Acciones**:
- Los warnings no previenen que se compile
- Se pueden ignorar o arreglar según sea necesario
- Los errores (rojos) sí previenen compilación

---

## Problemas de Navegador

### Aplicación lenta

**Síntomas**:
- Terminal responde lentamente
- Comandos tardan más de lo esperado
- Interfaz se congela

**Soluciones**:
```bash
# 1. Compilar para producción
pnpm build

# 2. Limpiar caché del navegador
# Chrome: Ctrl+Shift+Delete

# 3. Cerrar otras pestañas

# 4. Reiniciar navegador
```

---

### Teclas no responden

**Síntomas**:
- No se puede escribir en el input
- Las flechas no funcionan

**Soluciones**:
```bash
# 1. Hacer clic en el input para enfocarlo
# (debería haber un cursor parpadeante)

# 2. Si aún no funciona:
# - Recargar página (F5)
# - Limpiar caché (Ctrl+Shift+Delete)
# - Reiniciar navegador
```

---

### Contenido se ve distorsionado

**Síntomas**:
- Caracteres especiales no se muestran correctamente
- Saltos de línea no funcionan
- Colores extraños

**Soluciones**:
```bash
# 1. Verificar codificación UTF-8:
# En DevTools (F12) → Console:
> document.characterSet
"UTF-8"  # Debería mostrar esto

# 2. Recargar página
# 3. Limpiar CSS:
Ctrl+Shift+Delete (limpiar caché)
F5 (recargar)
```

---

### "CORS Error" o "Mixed Content Error"

**Síntoma**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Causa**: Intentar cargar recursos desde otro dominio.

**Solución**:
```bash
# Asegurar que todo se sirve desde localhost:5173
# No abrir desde file:// en el navegador

# Debe estar en:
# ✅ http://localhost:5173
# ❌ file:///ruta/al/archivo.html
```

---

## Problemas de Desarrollo

### Los cambios no se reflejan

**Síntoma**: Edito un archivo pero la aplicación no actualiza.

**Soluciones**:
```bash
# 1. Comprobar que el servidor está corriendo
# (revisa la terminal donde ejecutaste 'pnpm dev')

# 2. Recargar el navegador
# (Ctrl+R o F5)

# 3. Limpiar caché
# (Ctrl+Shift+Delete)

# 4. Si aún no funciona:
# Detener servidor (Ctrl+C)
# Limpiar build
# rm -rf dist
# Reiniciar servidor
# pnpm dev
```

---

### Error: "Module not found"

**Síntoma**:
```
Error: Cannot find module './path/to/module'
```

**Soluciones**:
1. Verifica que el archivo existe en la ruta especificada
2. Comprueba la ortografía del path
3. Asegúrate que el archivo está exportando correctamente
4. Revisa que el import está usando la ruta correcta

```typescript
// ✅ CORRECTO
import { ICommand } from '../../types/types';

// ❌ INCORRECTO
import { ICommand } from '../../types';  // Falta /types
```

---

### Problemas al agregar nuevo comando

**Síntomas**:
- El comando no aparece en `help`
- Error: "Command not found"

**Checklist**:
```bash
# 1. Archivo creado en la carpeta correcta
# src/commands/<categoria>/<nombre>.ts

# 2. Interfaz ICommand implementada correctamente
# con name, description, execute, etc.

# 3. Exportado en 00index.ts de la categoría

# 4. Registrado en src/commands/index.ts

# 5. Servidor reiniciado (Ctrl+C y pnpm dev)

# 6. Probado: help <nombre>
$ help micomando
```

---

## Reporte de Bugs

Si ninguna solución funciona:

1. **Reúne información**:
   - Navegador y versión (ej: Chrome 120)
   - SO (Windows/macOS/Linux)
   - Pasos exactos para reproducir
   - Mensajes de error

2. **Abre un issue en GitHub**:
   - Describe el problema claramente
   - Incluye pasos para reproducir
   - Adjunta screenshots si es posible
   - Revisa la consola (F12) para errores

3. **Incluye logs**:
   ```bash
   # Copiar errores de la consola del navegador
   # F12 → Console → Copy
   ```

---

## Recursos Útiles

- [Documentación Vite](https://vitejs.dev/)
- [Documentación TypeScript](https://www.typescriptlang.org/)
- [MDN - Consola del Navegador](https://developer.mozilla.org/es/docs/Tools/Browser_Console)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vite)

---

¿Aún necesitas ayuda? 
- Abre un [Issue en GitHub](https://github.com/.../.../issues)
- Consulta la [documentación completa](./README.md)
