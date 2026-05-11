# Arquitectura de Terminal Simulator

## Visión General

Terminal Simulator es una aplicación monolítica escrita en TypeScript que simula un terminal Linux completo en el navegador. La arquitectura sigue patrones de capas y separación de responsabilidades.

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (HTML/CSS)                     │
├─────────────────────────────────────────────────────────────┤
│                    Terminal.ts (UI Component)                │
├─────────────────────────────────────────────────────────────┤
│    main.ts (Event Handling & Bootstrap)                      │
├─────────────────────────────────────────────────────────────┤
│                    Kernel (Command Engine)                   │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ Environment  │  FileSystem  │ UserManager  │              │
│  └──────────────┴──────────────┴──────────────┘              │
├─────────────────────────────────────────────────────────────┤
│     Commands (System, Filesystem, Users, Text, Custom)       │
├─────────────────────────────────────────────────────────────┤
│  Types | Utils | Configuration (JSON)                        │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. **Kernel** (`src/core/Kernel.ts`)

El corazón de la aplicación. Responsable de:
- Registrar y gestionar comandos
- Ejecutar comandos
- Manejar pipes y redirecciones
- Mantener historial
- Coordinar los subsistemas

**Flujo de ejecución**:
```
Input → Parse → Validate → Execute → Output
 ↓
Check Pipes/Redirections
 ↓
Find Command
 ↓
Create Context
 ↓
Execute Handler
 ↓
Return Result
```

### 2. **FileSystem** (`src/core/FileSystem.ts`)

Emula un sistema de archivos jerárquico con:
- Nodos (archivos y directorios)
- Rutas relativas y absolutas
- Permisos POSIX (rwx)
- Contenido de archivos

**Estructura de Nodos**:
```typescript
interface FileSystemNode {
    name: string;
    type: 'file' | 'directory';
    owner: string;
    group: string;
    permissions: string;  // e.g., "drwxr-xr-x"
    content?: string;     // Solo para archivos
    children?: FileSystemNode[];  // Solo para directorios
}
```

### 3. **Environment** (`src/core/Environment.ts`)

Gestor de variables de entorno del sistema:
- Variables globales
- Getters y setters
- Carga desde configuración JSON
- Soporta expansión de variables en comandos

**Variables Comunes**:
```
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
HOME=/root
USER=root
PWD=/root
SHELL=/bin/bash
```

### 4. **UserManager** (`src/core/UserManager.ts`)

Gestión de usuarios y grupos:
- Registro de usuarios
- Grupos de usuarios
- Información de perfil
- Permisos basados en usuario

**Modelo de Usuarios**:
```typescript
interface User {
    uid: number;
    username: string;
    groups: string[];
    home: string;
    shell: string;
}
```

### 5. **Terminal UI** (`src/ui/Terminal.ts`)

Componente de interfaz que:
- Renderiza la salida de comandos
- Maneja el input del usuario
- Gestiona el prompt dinámico
- Limpia la pantalla

### 6. **Entry Point** (`src/main.ts`)

Bootstrap de la aplicación:
- Captura elementos del DOM
- Inicializa el Kernel
- Configura event listeners
- Gestiona el historial de comandos

## Subsistema de Comandos

### Estructura de Comando

```typescript
interface ICommand {
    name: string;
    alias?: string[];
    description: string;
    flags?: { [key: string]: string };
    execute: (args: string[], context: CommandContext) => Promise<string>;
}

interface CommandContext {
    kernel: Kernel;
    fs: FileSystem;
    env: Environment;
    userManager: UserManager;
    currentUser: User;
}
```

### Categorías de Comandos

#### **Sistema** (`src/commands/system/`)
- Información del sistema
- Utilidades generales
- Control de sesión

Archivos:
- `clear.ts` - Limpiar pantalla
- `date.ts` - Fecha/hora
- `echo.ts` - Imprimir texto
- `uptime.ts` - Tiempo de ejecución
- `who.ts` - Usuarios conectados
- `whoami.ts` - Usuario actual
- `sudo.ts` - Ejecutar como root
- `history.ts` - Historial de comandos
- `help.ts` - Ayuda del sistema
- `env.ts` - Mostrar variables de entorno

#### **Sistema de Archivos** (`src/commands/filesystem/`)
- Operaciones de archivos y directorios
- Control de permisos

Archivos:
- `ls.ts` - Listar directorio
- `cd.ts` - Cambiar directorio
- `pwd.ts` - Directorio actual
- `mkdir.ts` - Crear directorio
- `touch.ts` - Crear archivo
- `chmod.ts` - Cambiar permisos
- `chown.ts` - Cambiar propietario

#### **Texto** (`src/commands/text/`)
- Procesamiento de texto

Archivos:
- `cat.ts` - Mostrar contenido
- `grep.ts` - Búsqueda de patrones

#### **Usuarios** (`src/commands/users/`)
- Gestión de usuarios y grupos

Archivos:
- `adduser.ts` - Agregar usuario
- `deluser.ts` - Eliminar usuario
- `useradd.ts` - Agregar usuario (alternativa)
- `addgroup.ts` - Agregar grupo
- `delgroup.ts` - Eliminar grupo
- `groups.ts` - Mostrar grupos
- `su.ts` - Cambiar usuario

#### **Personalizado** (`src/commands/custom/`)
- Comandos específicos de la aplicación
- Extensiones

## Sistema de Tipos

### `src/types/types.ts`

Definiciones centrales de tipos:
- `ICommand` - Interfaz de comando
- `CommandContext` - Contexto de ejecución
- `ParsedCommand` - Comando parseado

### `src/types/result.ts`

Tipos de resultados y manejo de errores.

## Subsistema de Archivos

### PathResolver (`src/core/filesystem/PathResolver.ts`)

Resolver de rutas con soporte para:
- Rutas absolutas
- Rutas relativas
- `.` (directorio actual)
- `..` (directorio padre)
- Expansión de `~`

```typescript
// Ejemplos
resolve('/home/user', '../documents')  // → '/home/documents'
resolve('/home', 'user')               // → '/home/user'
resolve('/root', '~')                  // → '/root'
```

### NodeFactory (`src/core/filesystem/NodeFactory.ts`)

Factory para crear nodos del sistema de archivos con configuración apropiada.

### AccessControl (`src/core/filesystem/AccessControl.ts`)

Control de permisos POSIX:
- Permisos de lectura (r)
- Permisos de escritura (w)
- Permisos de ejecución (x)
- Owner, group, others

```
drwxr-xr-x
│││││││││
│││││││└─ Others: execute
│││││││
│││││└─── Others: write
││││
││││└──── Others: read
│││
││└────── Group: execute
│
│└─────── Group: write
└──────── Group: read
^
├─────── Owner: execute
└──────── Owner: write/directory
└──────── File type (d = directory)
```

## Flujo de Ejecución de Comando

```
1. Bootstrap (main.ts)
   ├─ Capturar elementos del DOM
   ├─ Crear instancia de Kernel
   ├─ Llamar kernel.boot()
   │  ├─ Cargar configuración JSON
   │  ├─ Inicializar FileSystem
   │  ├─ Cargar usuarios
   │  └─ Cargar variables de entorno
   └─ Crear instancia de Terminal UI

2. Input (Event Listener)
   └─ Usuario presiona Enter
      └─ Capturar valor del input

3. Procesamiento (Kernel.execute)
   ├─ Trimmed input
   ├─ Guardar en historial
   ├─ Detectar pipes (|)
   │  └─ Ejecutar secuencialmente
   ├─ Detectar redirecciones (>, >>)
   │  ├─ Ejecutar comando
   │  └─ Guardar output en archivo
   └─ Buscar comando en registro
      └─ Crear CommandContext
         └─ Ejecutar handler
            └─ Retornar resultado

4. Output (Terminal UI)
   ├─ Copiar input a salida
   ├─ Mostrar resultado
   ├─ Actualizar prompt
   └─ Limpiar input

5. Historia
   └─ Guardar comando en historial
      (accesible con ⬆️ y ⬇️)
```

## Persistencia

### Configuración JSON (`vms/*.json`)

Archivo de configuración inicial:

```json
{
  "fs": {
    "root": { /* estructura de archivos */ }
  },
  "users": [ /* lista de usuarios */ ],
  "groups": [ /* lista de grupos */ ],
  "env": { /* variables de entorno */ },
  "history": [ /* comandos previos */ ]
}
```

**Archivos disponibles**:
- `default.json` - Configuración estándar
- `webserver.json` - Configuración para servidor web

## Patrones de Diseño

### 1. **Singleton Pattern**
- `Kernel` - Una sola instancia
- `FileSystem` - Una sola instancia
- `UserManager` - Una sola instancia

### 2. **Factory Pattern**
- `NodeFactory` - Crear nodos del FS

### 3. **Command Pattern**
- `ICommand` - Cada comando es independiente
- Registro centralizado en `Kernel`

### 4. **Context Pattern**
- `CommandContext` - Pasar estado a comandos

### 5. **Strategy Pattern**
- Diferentes estrategias de comando
- Ejecución flexible

## Manejo de Errores

### Error Handling

Estrategia consistente:
- Try-catch en ejecución
- Mensajes de error descriptivos
- Códigos de error POSIX-like

**Ejemplo**:
```
$ cd /nonexistent
bash: cd: /nonexistent: No such file or directory
```

## Extensibilidad

### Agregar Nuevo Comando

1. Crear archivo en categoría apropiada
2. Implementar interfaz `ICommand`
3. Registrar en `src/commands/index.ts`
4. El Kernel cargará automáticamente

### Agregar Nueva Categoría

1. Crear carpeta en `src/commands/<categoria>/`
2. Crear archivo `00index.ts` para exportar comandos
3. Registrar en `src/commands/index.ts`

### Extender FileSystem

1. Agregar métodos en `FileSystem.ts`
2. Usar desde comandos vía `context.fs`

## Consideraciones de Performance

- **Carga inicial**: ~50-100ms (cargar JSON)
- **Ejecución de comando**: ~1-5ms (mayoría)
- **Operaciones pesadas**: grep, búsqueda recursiva (~10-50ms)
- **Redirecciones**: Overhead mínimo

## Roadmap de Arquitectura

- [ ] Soporte para scripts (.sh)
- [ ] Redirecciones de entrada (<)
- [ ] Conectores AND (&&) y OR (||)
- [ ] Globbing (*, ?, [])
- [ ] Aliases de usuario
- [ ] Sistema de permisos más granular
