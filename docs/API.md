# API Reference

Documentación de la interfaz programática de Terminal Simulator para desarrolladores que deseen integrar o extender el sistema.

## Tabla de Contenidos

- [Kernel](#kernel)
- [FileSystem](#filesystem)
- [Environment](#environment)
- [UserManager](#usermanager)
- [Types](#types)
- [Utils](#utils)

---

## Kernel

El kernel es el corazón del sistema y administra la ejecución de comandos.

### Clase: `Kernel`

```typescript
class Kernel {
    constructor();
    boot(): Promise<void>;
    execute(input: string, skipHistory?: boolean): Promise<string>;
    getPromptText(): string;
    getHistory(): string[];
    private loadCommands(): void;
    private processCommandLine(commandLine: string, pipeInput?: string): Promise<string>;
}
```

### Método: `boot()`

Inicializa el kernel cargando la configuración del sistema.

```typescript
const kernel = new Kernel();
await kernel.boot(); // Cargar configuración de vms/default.json
```

**Parámetros**: Ninguno

**Retorna**: `Promise<void>`

**Excepciones**: Si no encuentra la configuración, carga valores por defecto.

---

### Método: `execute()`

Ejecuta un comando del usuario.

```typescript
const kernel = new Kernel();
const result = await kernel.execute('ls -la');
console.log(result); // Salida del comando
```

**Parámetros**:
- `input: string` - Comando a ejecutar
- `skipHistory?: boolean` - (Opcional, default: false) Saltar historial

**Retorna**: `Promise<string>` - Salida del comando

**Características**:
- Soporta pipes: `cat file.txt | grep error`
- Soporta redirecciones: `echo test > file.txt`
- Maneja historiales automáticamente

**Ejemplos**:
```typescript
// Comando simple
await kernel.execute('whoami'); // → "root"

// Con pipes
await kernel.execute('cat log.txt | grep error');

// Con redirección
await kernel.execute('echo "contenido" > archivo.txt');

// Saltar historial
await kernel.execute('ls', true); // No guardar en historial
```

---

### Método: `getPromptText()`

Obtiene el texto del prompt actual (ej: `root@ubuntu:~#`).

```typescript
const prompt = kernel.getPromptText();
console.log(prompt); // "root@ubuntu:/root#"
```

**Parámetros**: Ninguno

**Retorna**: `string` - Texto del prompt formateado

---

### Método: `getHistory()`

Obtiene el historial de comandos ejecutados.

```typescript
const history = kernel.getHistory();
console.log(history); // ["ls", "cd /home", "pwd"]
```

**Parámetros**: Ninguno

**Retorna**: `string[]` - Array de comandos ejecutados

---

## FileSystem

Administra el sistema de archivos virtual.

### Clase: `FileSystem`

```typescript
class FileSystem {
    constructor(env: Environment);
    loadFromJSON(config: any): void;
    loadDefaults(): void;
    getNode(path: string): FileSystemNode | null;
    createFile(path: string, owner: string, content?: string): boolean;
    createDirectory(path: string, owner: string): boolean;
    deleteNode(path: string): boolean;
    readFile(path: string): string | null;
    writeFile(path: string, content: string): boolean;
    appendFile(path: string, content: string): boolean;
    listDirectory(path: string): FileSystemNode[];
    getCurrentDirectory(): string;
    resolvePath(path: string): string;
    hasPermission(path: string, operation: 'read'|'write'|'execute', user: User): boolean;
    changePermissions(path: string, permissions: string): boolean;
    changeOwner(path: string, owner: string, group?: string): boolean;
}
```

### Método: `getNode()`

Obtiene un nodo del sistema de archivos.

```typescript
const kernel = new Kernel();
const node = kernel.fs.getNode('/home/usuario');
if (node) {
    console.log(`Tipo: ${node.type}`);
    console.log(`Permisos: ${node.permissions}`);
}
```

**Parámetros**:
- `path: string` - Ruta del nodo

**Retorna**: `FileSystemNode | null` - El nodo o null si no existe

---

### Método: `createFile()`

Crea un nuevo archivo.

```typescript
kernel.fs.createFile('/home/usuario/archivo.txt', 'usuario', 'Contenido inicial');
```

**Parámetros**:
- `path: string` - Ruta del archivo
- `owner: string` - Propietario del archivo
- `content?: string` - Contenido inicial (opcional)

**Retorna**: `boolean` - true si se creó, false si falló

---

### Método: `readFile()`

Lee el contenido de un archivo.

```typescript
const contenido = kernel.fs.readFile('/home/usuario/archivo.txt');
console.log(contenido); // "Contenido del archivo"
```

**Parámetros**:
- `path: string` - Ruta del archivo

**Retorna**: `string | null` - Contenido o null si no existe/no es archivo

---

### Método: `writeFile()`

Sobrescribe el contenido de un archivo.

```typescript
kernel.fs.writeFile('/home/usuario/archivo.txt', 'Nuevo contenido');
```

**Parámetros**:
- `path: string` - Ruta del archivo
- `content: string` - Nuevo contenido

**Retorna**: `boolean` - true si se escribió, false si falló

---

### Método: `appendFile()`

Agrega contenido al final de un archivo.

```typescript
kernel.fs.appendFile('/var/log/app.log', 'Nueva línea de log\n');
```

**Parámetros**:
- `path: string` - Ruta del archivo
- `content: string` - Contenido a agregar

**Retorna**: `boolean` - true si se agregó, false si falló

---

### Método: `listDirectory()`

Lista el contenido de un directorio.

```typescript
const archivos = kernel.fs.listDirectory('/home');
archivos.forEach(node => {
    console.log(`${node.type} - ${node.name}`);
});
```

**Parámetros**:
- `path: string` - Ruta del directorio

**Retorna**: `FileSystemNode[]` - Array de nodos en el directorio

---

### Método: `resolvePath()`

Resuelve una ruta relativa o absoluta a ruta absoluta.

```typescript
const resolved = kernel.fs.resolvePath('~/documentos');
console.log(resolved); // "/root/documentos"

const resolved2 = kernel.fs.resolvePath('../parent');
console.log(resolved2); // Ruta resuelta relativa al cwd
```

**Parámetros**:
- `path: string` - Ruta a resolver

**Retorna**: `string` - Ruta absoluta

---

### Método: `hasPermission()`

Verifica si un usuario tiene permisos para una operación.

```typescript
const user = kernel.userManager.getUser('usuario');
if (kernel.fs.hasPermission('/home/usuario', 'write', user)) {
    // Usuario puede escribir
}
```

**Parámetros**:
- `path: string` - Ruta del archivo/directorio
- `operation: 'read'|'write'|'execute'` - Operación a verificar
- `user: User` - Usuario a verificar

**Retorna**: `boolean` - true si tiene permisos

---

## Environment

Administra las variables de entorno del sistema.

### Clase: `Environment`

```typescript
class Environment {
    constructor();
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    getAll(): Record<string, string>;
    expandVariables(text: string): string;
    loadDefaults(): void;
    loadFromObject(obj: Record<string, string>): void;
}
```

### Método: `get()`

Obtiene el valor de una variable de entorno.

```typescript
const home = kernel.env.get('HOME');
console.log(home); // "/root"
```

**Parámetros**:
- `key: string` - Nombre de la variable

**Retorna**: `string | undefined` - Valor de la variable o undefined

---

### Método: `set()`

Establece una variable de entorno.

```typescript
kernel.env.set('MYVAR', 'valor');
console.log(kernel.env.get('MYVAR')); // "valor"
```

**Parámetros**:
- `key: string` - Nombre de la variable
- `value: string` - Valor de la variable

**Retorna**: `void`

---

### Método: `expandVariables()`

Expande variables en una cadena de texto.

```typescript
const expanded = kernel.env.expandVariables('Mi home es $HOME');
console.log(expanded); // "Mi home es /root"
```

**Parámetros**:
- `text: string` - Texto con variables

**Retorna**: `string` - Texto con variables expandidas

---

### Método: `getAll()`

Obtiene todas las variables de entorno.

```typescript
const allVars = kernel.env.getAll();
console.log(allVars);
// { PATH: "...", HOME: "/root", USER: "root", ... }
```

**Parámetros**: Ninguno

**Retorna**: `Record<string, string>` - Objeto con todas las variables

---

## UserManager

Administra usuarios y grupos del sistema.

### Clase: `UserManager`

```typescript
class UserManager {
    constructor(fs: FileSystem);
    getUser(username: string): User | null;
    getUserById(uid: number): User | null;
    createUser(username: string, uid: number, home: string, shell: string): boolean;
    deleteUser(username: string): boolean;
    getGroup(groupname: string): Group | null;
    createGroup(groupname: string, gid: number): boolean;
    deleteGroup(groupname: string): boolean;
    addUserToGroup(username: string, groupname: string): boolean;
    removeUserFromGroup(username: string, groupname: string): boolean;
    getCurrentUser(): User;
    setCurrentUser(username: string): boolean;
    loadUsers(users: User[]): void;
    loadGroups(groups: Group[]): void;
    loadDefaults(): void;
}
```

### Método: `getUser()`

Obtiene un usuario por nombre.

```typescript
const user = kernel.userManager.getUser('root');
if (user) {
    console.log(`UID: ${user.uid}`);
    console.log(`Home: ${user.home}`);
}
```

**Parámetros**:
- `username: string` - Nombre del usuario

**Retorna**: `User | null` - Usuario o null si no existe

---

### Método: `createUser()`

Crea un nuevo usuario.

```typescript
kernel.userManager.createUser('newuser', 1001, '/home/newuser', '/bin/bash');
```

**Parámetros**:
- `username: string` - Nombre del usuario
- `uid: number` - ID del usuario
- `home: string` - Directorio home
- `shell: string` - Shell del usuario

**Retorna**: `boolean` - true si se creó, false si falló

---

### Método: `getCurrentUser()`

Obtiene el usuario actual.

```typescript
const currentUser = kernel.userManager.getCurrentUser();
console.log(`Usuario actual: ${currentUser.username}`);
```

**Parámetros**: Ninguno

**Retorna**: `User` - Usuario actual del sistema

---

## Types

Interfaces y tipos principales del sistema.

### Interface: `ICommand`

```typescript
interface ICommand {
    name: string;
    alias?: string[];
    description: string;
    flags?: { [key: string]: string };
    execute: (args: string[], context: CommandContext) => Promise<string>;
}
```

**Propiedades**:
- `name: string` - Nombre del comando
- `alias?: string[]` - Alias del comando (e.g., ["ls", "l"])
- `description: string` - Descripción corta
- `flags?: object` - Flags soportados con sus descripciones
- `execute: function` - Función que ejecuta el comando

**Ejemplo**:
```typescript
const miComando: ICommand = {
    name: 'mi-comando',
    alias: ['mc'],
    description: 'Descripción del comando',
    flags: {
        '-v': 'Verbose',
        '-h': 'Help'
    },
    execute: async (args, context) => {
        return 'Resultado';
    }
};
```

---

### Interface: `CommandContext`

```typescript
interface CommandContext {
    kernel: Kernel;
    fs: FileSystem;
    env: Environment;
    userManager: UserManager;
    currentUser: User;
}
```

**Propiedades**:
- `kernel: Kernel` - Instancia del kernel
- `fs: FileSystem` - Instancia del filesystem
- `env: Environment` - Instancia del environment
- `userManager: UserManager` - Instancia del user manager
- `currentUser: User` - Usuario que ejecuta el comando

---

### Interface: `User`

```typescript
interface User {
    uid: number;
    username: string;
    groups: string[];
    home: string;
    shell: string;
}
```

---

### Interface: `FileSystemNode`

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

---

## Utils

Funciones auxiliares y utilidades.

### Modulo: `errors.ts`

Manejo centralizado de errores.

```typescript
import { parseError, formatError } from '../utils/errors';

try {
    // código
} catch (error) {
    const formatted = formatError(error);
    console.error(formatted);
}
```

---

### Modulo: `formatters.ts`

Funciones de formato.

```typescript
import { formatPermissions, formatDate, formatSize } from '../utils/formatters';

console.log(formatPermissions('755'));      // "rwxr-xr-x"
console.log(formatDate(new Date()));         // "May 11 14:30"
console.log(formatSize(1234567));           // "1.2M"
```

---

## Ejemplos Prácticos

### Crear un Sistema Personalizado

```typescript
import { Kernel } from './core/Kernel';
import { TerminalUI } from './ui/Terminal';

async function initializeCustomSystem() {
    const kernel = new Kernel();
    
    // Cargar configuración personalizada
    await kernel.boot();
    
    // Crear usuario personalizado
    kernel.userManager.createUser('developer', 1001, '/home/developer', '/bin/bash');
    
    // Cambiar a ese usuario
    kernel.userManager.setCurrentUser('developer');
    
    // Crear directorio
    kernel.fs.createDirectory('/home/developer/projects', 'developer');
    
    // Crear archivo
    kernel.fs.createFile('/home/developer/projects/README.md', 'developer', '# Mi Proyecto');
    
    return kernel;
}
```

### Ejecutar Comandos Programáticamente

```typescript
const kernel = new Kernel();
await kernel.boot();

// Ejecutar comando simple
const whoami = await kernel.execute('whoami');
console.log(whoami); // "root"

// Ejecutar con redirección
await kernel.execute('echo "Contenido" > /tmp/file.txt');

// Leer archivo creado
const content = kernel.fs.readFile('/tmp/file.txt');
console.log(content); // "Contenido"
```

### Crear Comando Personalizado

Ver [CONTRIBUTING.md](./CONTRIBUTING.md#agregar-comandos) para detalles completos.

```typescript
import { ICommand } from '../../types/types';

export const myCommand: ICommand = {
    name: 'mycommand',
    description: 'My custom command',
    execute: async (args, context) => {
        const user = context.currentUser.username;
        const cwd = context.env.get('PWD');
        return `Ejecutado por ${user} en ${cwd}`;
    }
};
```

---

## Soporte

Para preguntas o problemas con la API:
- Consulta la [documentación de arquitectura](./ARCHITECTURE.md)
- Revisa los [ejemplos en el código](../src/commands/)
- Abre un issue en GitHub
