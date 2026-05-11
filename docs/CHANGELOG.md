# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/es/).

---

## [0.1.0] - 2026-05-11

### ✨ Agregado

- **Kernel Central**: Motor de ejecución de comandos con soporte para pipes y redirecciones
- **Comandos del Sistema**: 
  - `clear`, `echo`, `date`, `uptime`, `who`, `whoami`, `sudo`, `history`, `help`, `env`
- **Comandos de Archivos**:
  - `ls`, `cd`, `pwd`, `mkdir`, `touch`, `cat`, `chmod`, `chown`
- **Comandos de Texto**:
  - `grep`, `cat`
- **Comandos de Usuarios**:
  - `adduser`, `deluser`, `useradd`, `addgroup`, `delgroup`, `groups`, `su`
- **Sistema de Archivos Virtual**: Jerarquía de directorios con permisos POSIX
- **Gestión de Usuarios**: Sistema multiusuario con grupos
- **Variables de Entorno**: Sistema completo con expansión de variables
- **Historial de Comandos**: Accesible con flechas ⬆️ ⬇️
- **UI Terminal**: Interfaz interactiva en navegador
- **Configuración Inicial**: Sistema de carga desde JSON
- **Documentación Completa**: 
  - README.md mejorado
  - GETTING_STARTED.md
  - COMMANDS.md
  - ARCHITECTURE.md
  - API.md
  - CONTRIBUTING.md
  - TROUBLESHOOTING.md

### 🔧 Técnico

- TypeScript 5.2.2
- Vite 5.0.0
- Estructura modular con separación de responsabilidades
- Soporte para pipes (`|`)
- Soporte para redirecciones (`>`, `>>`)
- Factory pattern para nodos del filesystem
- Control de acceso basado en permisos

### 📝 Notas

- Primera versión estable del simulador
- Todos los comandos básicos funcionan
- Sistema de archivos totalmente funcional
- Documentación completa para usuarios y desarrolladores

---

## [0.2.0] - Próximo (Planificado)

Ver [ROADMAP.md](./ROADMAP.md) para características planeadas.

---

## Versionado

La versión del proyecto sigue Semantic Versioning:
- **MAJOR**: Cambios incompatibles
- **MINOR**: Nuevas características compatibles
- **PATCH**: Correcciones de bugs

Formato: `MAJOR.MINOR.PATCH`

Ejemplo: `0.1.0` (versión inicial)

---

## Cómo Referenciar Cambios

En commits, usa la siguiente estructura:

```
type: descripción breve

[body opcional]

[footer opcional]
```

Tipos:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `refactor:` Refactorización de código
- `perf:` Mejora de performance
- `test:` Agregar o actualizar tests
- `build:` Cambios en build/dependencias

Ejemplos:
```
feat: agregar comando 'tail'

docs: mejorar sección de pipes en COMMANDS.md

fix: corregir permisos en mkdir

refactor: simplificar PathResolver
```

---

## Historial Anterior

Este es el primer registro. Versiones previas no han sido documentadas.

---

*Última actualización: May 11, 2026*
