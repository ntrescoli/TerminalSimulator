# Terminal Simulator 🖥️

Simulador interactivo de terminal Linux/Ubuntu en el navegador. Escrito en **TypeScript** con **Vite**.

## 📋 Descripción

Terminal Simulator es una aplicación web que emula un terminal Linux completo con:

- 🗂️ **Sistema de archivos virtual** - Completo con directorios, archivos y permisos
- 👥 **Gestión de usuarios y grupos** - Sistema UNIX completo
- ⌨️ **40+ comandos del sistema** - `ls`, `cd`, `mkdir`, `grep`, `chmod`, etc.
- 📝 **Historial de comandos** - Con navegación ↑/↓
- 🔒 **Control de permisos** - Sistema rwx completo
- 🔗 **Pipes y redirecciones** - `|`, `>`, `>>` totalmente funcionales
- 🎯 **Variables de entorno** - `PATH`, `HOME`, `USER`, etc.
- 💾 **Persistencia de estado** - Guarda el estado de la máquina virtual

Perfecto para:
- 📚 **Educación** - Enseñar Linux interactivamente
- 🧪 **Demostraciones** - Mostrar comandos en vivo
- 🎮 **Entretenimiento** - Terminal interactiva en el navegador
- 🔧 **Componente embebible** - Integrar en otros proyectos

## 🚀 Instalación

### Requisitos
- Node.js 18+ o superior
- pnpm (recomendado) o npm

### Pasos

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Acceder a http://localhost:5173
```

Para producción:

```bash
pnpm build
pnpm preview
```

## 📁 Estructura del Proyecto

```
TerminalSimulator/
├── src/
│   ├── main.ts                     # Entrada principal
│   ├── kernel/                     # Núcleo del sistema
│   ├── slices/                     # Features modulares
│   ├── ui/                         # Componentes UI
│   └── result/                     # Manejo de errores
├── tests/                          # Tests
├── vms/                            # Configuraciones de VM
├── docs/                           # Documentación
├── index.html                      # HTML principal
├── style.css                       # Estilos
└── package.json                    # Configuración
```

## 🎮 Comandos Disponibles

### Sistema
```bash
clear              # Limpiar pantalla
echo [texto]       # Imprimir texto
date               # Fecha y hora actual
uptime             # Tiempo de ejecución
who                # Usuarios conectados
whoami             # Usuario actual
help               # Listar comandos
history            # Historial de comandos
```

### Navegación y Archivos
```bash
ls [-la]           # Listar directorio
cd [ruta]          # Cambiar directorio
pwd                # Ruta actual
mkdir [dir]        # Crear directorio
touch [archivo]    # Crear archivo
cat [archivo]      # Ver contenido
rm [-r] [archivo]  # Eliminar
cp [src] [dest]    # Copiar
mv [src] [dest]    # Mover
```

### Usuarios
```bash
adduser [usuario]  # Crear usuario
deluser [usuario]  # Eliminar usuario
su [usuario]       # Cambiar usuario
groups [usuario]   # Ver grupos
sudo [comando]     # Ejecutar como root
passwd [usuario]   # Cambiar contraseña
```

### Texto y Búsqueda
```bash
grep [patrón]      # Buscar en archivo
cat [archivo]      # Ver contenido
wc [archivo]       # Contar líneas
```

### Permisos
```bash
chmod [modo]       # Cambiar permisos
chown [user]       # Cambiar propietario
```

Ver completo: [COMMANDS.md](./docs/COMMANDS.md)

## 📖 Documentación

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura del sistema y decisiones de diseño
- [API.md](./docs/API.md) - Referencia completa de la API pública
- [COMMANDS.md](./docs/COMMANDS.md) - Documentación detallada de comandos
- [EMBEDDING.md](./docs/EMBEDDING.md) - Cómo usarlo como componente en otros proyectos
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Guía para contribuir al proyecto

## 🔧 Desarrollo

```bash
pnpm dev           # Servidor de desarrollo
pnpm build         # Compilar para producción
pnpm lint          # Ejecutar ESLint
pnpm test          # Ejecutar tests
```

## 📦 Configuraciones de VM

Disponibles en `vms/`:
- `default.json` - Ubuntu con usuario ubuntu y root
- `webserver.json` - Configuración minimalista para servidor web



## 📚 Documentación

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura del sistema
- [COMMANDS.md](./docs/COMMANDS.md) - Lista de comandos
- [API.md](./docs/API.md) - API pública


## Notas

- Testeo provisional: iniciar con http://localhost:5173/hypervisor.html muestra una seleccion de json iniciales
- La arquitectura hexadonal dentro de la VM se organiza en slices
- El slice de users y groups usa la infrastructure para escribir los archivos falsos passwd y group
- Hay problemas con la detección de texto. crear usuarios que empiezan igual da problemas, flags