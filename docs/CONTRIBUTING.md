# Guía de Contribución

¡Gracias por tu interés en contribuir a Terminal Simulator! Esta guía te ayudará a entender cómo puedes ayudar al proyecto.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)
- [Guía de Pull Requests](#guía-de-pull-requests)
- [Guía de Estilo](#guía-de-estilo)
- [Agregar Comandos](#agregar-comandos)
- [Preguntas](#preguntas)

---

## Código de Conducta

Este proyecto y todos sus participantes se comprometen a mantener un ambiente amigable, acogedor y libre de acoso. Se espera que todos los contribuyentes:

- Usen lenguaje respectuoso
- Acepten crítica constructiva
- Se enfoquen en lo mejor para la comunidad
- Muestren empatía con otros miembros

Comportamientos inaceptables serán tratados según sea apropiado.

---

## Cómo Contribuir

### Formas de Contribuir

1. **Reportar Bugs** - Encontraste un error
2. **Sugerir Mejoras** - Tienes una idea nueva
3. **Agregar Comandos** - Implementar nuevos comandos
4. **Mejorar Documentación** - Clarificar o expandir docs
5. **Corregir Bugs** - Solucionar problemas existentes
6. **Optimización** - Mejorar performance

### Primeros Pasos

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-contribucion`
3. Haz tus cambios
4. Commit: `git commit -am 'Agregar nueva funcionalidad'`
5. Push: `git push origin feature/mi-contribucion`
6. Abre un Pull Request

---

## Reportar Bugs

### Antes de Reportar

- Verifica que no esté ya reportado en Issues
- Intenta reproducir el bug
- Revisa la documentación
- Prueba con la última versión

### Cómo Reportar

Abre un Issue con el siguiente formato:

```markdown
**Descripción del Bug**
Descripción clara y concisa de qué está mal.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

**Comportamiento Esperado**
Qué debería suceder.

**Comportamiento Actual**
Qué sucede realmente.

**Entorno**
- Navegador: [ej. Chrome 120]
- OS: [ej. Windows 11]
- Versión: [ej. 0.1.0]

**Capturas de Pantalla**
Si aplica, adjunta screenshots.

**Información Adicional**
Cualquier contexto relevante.
```

---

## Sugerir Mejoras

### Antes de Sugerir

- Verifica que no esté ya sugerido
- Piensa si tu idea se alinea con el alcance del proyecto
- Reúne casos de uso

### Cómo Sugerir

Abre un Issue etiquetado como `enhancement`:

```markdown
**Descripción de la Mejora**
Una descripción clara de la nueva funcionalidad.

**Problema que Resuelve**
Qué problema soluciona esto.

**Solución Propuesta**
Tu implementación propuesta.

**Alternativas Consideradas**
Otros enfoques que pensaste.

**Contexto Adicional**
Cualquier información relevante.
```

---

## Guía de Pull Requests

### Preparar tu PR

1. **Fork y Clone**:
   ```bash
   git clone https://github.com/TU_USUARIO/TerminalSimulator.git
   cd TerminalSimulator
   ```

2. **Crear Rama**:
   ```bash
   git checkout -b feature/descripcion-clara
   ```
   Usa nombres descriptivos: `feature/`, `fix/`, `docs/`, `refactor/`

3. **Instalar Dependencias**:
   ```bash
   pnpm install
   ```

4. **Hacer Cambios**:
   - Escribe código limpio
   - Sigue la guía de estilo
   - Commit frecuentes: `git commit -am "Mensaje descriptivo"`

5. **Compilar y Probar**:
   ```bash
   pnpm build
   # Prueba manualmente en el navegador
   ```

### Enviar PR

1. Push a tu fork: `git push origin feature/descripcion`
2. Abre un PR en GitHub
3. Completa la plantilla de PR:

```markdown
## Descripción
Descripción clara de los cambios.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Mejora de documentación

## Cambios
- Cambio 1
- Cambio 2

## Testing
Describe cómo probaste esto:
1. Paso 1
2. Paso 2

## Checklist
- [ ] Seguí la guía de estilo
- [ ] Actualicé la documentación
- [ ] Mis cambios no rompen tests
- [ ] Agregué tests si es necesario
```

### Después de Enviar

- Responde a cualquier pregunta o solicitud
- Estar abierto a feedback
- Hacer cambios si se solicita
- El PR será mergeado una vez aprobado

---

## Guía de Estilo

### TypeScript

```typescript
// ✅ BIEN

// 1. Nombres descriptivos
const getUserById = (id: number): User => {
    return userMap.get(id);
};

// 2. Tipos explícitos
const config: IConfig = loadConfig();

// 3. Manejo de errores
try {
    // código
} catch (error) {
    console.error('Descripción clara del error:', error);
    throw new Error('Mensaje de error claro');
}

// 4. Funciones pequeñas
const parseArguments = (input: string): string[] => {
    return input.trim().split(/\s+/);
};

// 5. Comentarios útiles
// Explicar el "por qué", no el "qué"
const retryCount = 3; // Reintentar hasta 3 veces para manejar timeouts ocasionales

// ❌ EVITAR

// Nombres genéricos
const x = getData();

// Tipos genéricos
const data = loadConfig();

// Sin manejo de errores
execute(command);

// Funciones muy largas
const doEverything = () => { /* 200 líneas */ };

// Comentarios obvios
const i = 0; // Establecer i a 0
```

### Estructura de Archivos

```
src/commands/nuevacategoria/
├── 00index.ts          # Exportar comandos
├── comando1.ts         # Comando 1
├── comando2.ts         # Comando 2
└── types.ts           # Tipos locales (si es necesario)
```

### Formato de Código

```bash
# Usar TypeScript strict
"strict": true

# Indentación: 4 espacios
# Línea máxima: 100 caracteres
# Semicolons: Sí
```

---

## Agregar Comandos

### Paso 1: Crear el Archivo

En `src/commands/<categoría>/<nombre>.ts`:

```typescript
import { ICommand, CommandContext } from '../../types/types';

export const miComando: ICommand = {
    name: 'micomando',
    alias: ['mc', 'mi'],
    description: 'Descripción clara del comando',
    flags: {
        '-v': 'Verbose - mostrar detalles',
        '-h': 'Help - mostrar ayuda',
    },
    execute: async (args: string[], context: CommandContext): Promise<string> => {
        try {
            // Procesar flags
            const verbose = args.includes('-v');
            const help = args.includes('-h');

            if (help) {
                return `Uso: micomando [-v] [-h]
Descripción: ${this.description}
Flags: ${Object.entries(this.flags || {})
                    .map(([f, d]) => `${f}\t${d}`)
                    .join('\n')}`;
            }

            // Lógica principal
            const result = await doSomething(context, args);

            // Retornar resultado
            return result;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
};
```

### Paso 2: Registrar el Comando

En `src/commands/<categoría>/00index.ts`:

```typescript
import { miComando } from './micomando';

export const comandos = [
    miComando,
    // otros comandos...
];
```

En `src/commands/index.ts`:

```typescript
import { comandos as nuevaCategoría } from './nuevacategoria';

export const commandList: ICommand[] = [
    // ... otros comandos
    ...nuevaCategoría,
];
```

### Paso 3: Agregar Documentación

En `docs/COMMANDS.md`, agrega sección:

```markdown
### \`micomando\`

Descripción clara.

\`\`\`
Uso: micomando [OPTIONS]
Flags:
  -v   Descripción
  -h   Descripción
\`\`\`

**Ejemplos**:
\`\`\`bash
$ micomando
resultado
\`\`\`
```

### Paso 4: Pruebar

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Probar en navegador
$ micomando
$ micomando -v
$ micomando -h
```

---

## Mejores Prácticas

### Comandos

1. **Validar Entrada**
   ```typescript
   if (args.length === 0) {
       return 'Error: Se requiere un argumento';
   }
   ```

2. **Usar Contexto**
   ```typescript
   const currentDir = context.env.get('PWD');
   const currentUser = context.userManager.getCurrentUser();
   ```

3. **Seguir Comportamiento Linux**
   - Salida clara
   - Códigos de error (si aplica)
   - Flags consistentes

4. **Documentar Bien**
   - Description clara
   - Flags documentados
   - Ejemplos de uso

### FileSystem

1. **Respetar Permisos**
   ```typescript
   if (!context.fs.hasPermission(path, 'read', context.currentUser)) {
       return 'Permission denied';
   }
   ```

2. **Usar PathResolver**
   ```typescript
   const resolved = context.fs.resolvePath(path, context.env);
   ```

3. **Manejar Rutas Especiales**
   - `~` → home del usuario
   - `..` → directorio padre
   - `.` → directorio actual

---

## Preguntas

Si tienes preguntas:

1. Revisa la [documentación](../README.md)
2. Busca en Issues existentes
3. Abre una Discussion
4. Contacta a los maintainers

---

## Licencia

Al contribuir, aceptas que tu código sea licenciado bajo MIT.

---

¡Gracias por tu contribución! 🎉
