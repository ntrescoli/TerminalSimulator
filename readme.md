# Terminal Simulator 🖥️

Un simulador interactivo de terminal Linux/Ubuntu funcional en el navegador. Escrito en TypeScript con Vite.

## 📋 Descripción

Terminal Simulator es una aplicación web que emula un terminal Linux completo con:
- Sistema de archivos virtual
- Gestión de usuarios y permisos
- Historial de comandos
- Variables de entorno
- Soporte para pipes (`|`) y redirecciones (`>`, `>>`)
- Más de 40 comandos del sistema

Perfecto para aprender Linux, hacer demostraciones educativas o entretenimiento interactivo.

## 🚀 Instalación

### Requisitos
- Node.js 18+ o superior
- pnpm (recomendado) o npm

### Pasos

```bash
# Clonar el repositorio
git clone <repository-url>
cd TerminalSimulator

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Vista previa de producción
pnpm preview
```

## 📁 Estructura del Proyecto

```
TerminalSimulator/
├── src/
│   ├── main.ts                 # Punto de entrada, manejo de eventos
│   ├── core/                   # Núcleo del sistema
│   │   ├── Kernel.ts           # Motor de ejecución de comandos
│   │   ├── Environment.ts      # Variables de entorno
│   │   ├── FileSystem.ts       # Sistema de archivos virtual
│   │   ├── UserManager.ts      # Gestión de usuarios y grupos
│   │   └── filesystem/
│   │       ├── AccessControl.ts    # Control de permisos (rwx)
│   │       ├── NodeFactory.ts      # Factory para crear nodos
│   │       └── PathResolver.ts     # Resolver de rutas
│   ├── commands/               # Implementación de comandos
│   │   ├── index.ts            # Registro central
│   │   ├── system/             # Comandos del sistema
│   │   ├── filesystem/         # Comandos de archivos
│   │   ├── text/               # Comandos de texto
│   │   ├── users/              # Comandos de usuarios
│   │   └── custom/             # Comandos personalizados
│   ├── types/                  # Tipos e interfaces TypeScript
│   ├── ui/                     # Componentes UI
│   └── utils/                  # Utilidades
├── vms/                        # Configuraciones iniciales
├── index.html                  # HTML principal
├── style.css                   # Estilos
└── vite.config.ts             # Configuración Vite
```

## 🎮 Comandos Disponibles

### Sistema
`clear`, `echo`, `date`, `uptime`, `who`, `whoami`, `sudo`, `history`, `help`

### Archivos
`ls`, `cd`, `pwd`, `mkdir`, `touch`, `cat`, `rm`, `cp`, `mv`

### Usuarios
`adduser`, `deluser`, `useradd`, `addgroup`, `delgroup`, `groups`, `su`

### Texto
`grep`, `cat`

### Permisos
`chmod`, `chown`

## 🔧 Desarrollo

Para agregar nuevos comandos, consulta [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## 📚 Documentación

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura del sistema
- [COMMANDS.md](./docs/COMMANDS.md) - Documentación de comandos
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Guía de contribución
- [API.md](./docs/API.md) - Interfaz programática


## Notas

- Testeo provisional: iniciar con http://localhost:5173/hypervisor.html muestra una seleccion de json iniciales
- La arquitectura hexadonal dentro de la VM se organiza en slices
- El slice de users y groups usa la infrastructure para escribir los archivos falsos passwd y group
- Hay problemas con la detección de texto. crear usuarios que empiezan igual da problemas, flags