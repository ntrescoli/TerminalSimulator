# Documentación - Índice

Bienvenido a la documentación completa de Terminal Simulator. Elige dónde quieres empezar:

## 🚀 Para Usuarios

### [GETTING_STARTED.md](./GETTING_STARTED.md) - Inicio Rápido
Aprende los comandos básicos en 5 minutos. Perfecto si es tu primera vez usando el simulador.

**Contenido**:
- Instalación rápida
- Primeros comandos
- Exploración del sistema
- Gestión de archivos
- Búsqueda de ayuda

**Tiempo de lectura**: 10 minutos

---

### [COMMANDS.md](./COMMANDS.md) - Referencia de Comandos
Documentación completa de todos los comandos disponibles con ejemplos.

**Contenido**:
- Comandos del sistema
- Comandos de archivos
- Comandos de texto
- Comandos de usuarios
- Tabla rápida de referencia

**Tiempo de lectura**: 20 minutos

---

### [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de Problemas
Encuentra respuestas a problemas comunes.

**Contenido**:
- Problemas de instalación
- Problemas de ejecución
- Problemas de comandos
- Problemas de navegador
- Reporte de bugs

**Tiempo de lectura**: 15 minutos

---

## 👨‍💻 Para Desarrolladores

### [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del Sistema
Comprende cómo funciona Terminal Simulator internamente.

**Contenido**:
- Visión general de la arquitectura
- Componentes principales (Kernel, FileSystem, Environment, UserManager)
- Sistema de comandos
- Subsistema de archivos
- Patrones de diseño
- Flujo de ejecución

**Tiempo de lectura**: 30 minutos

---

### [API.md](./API.md) - Referencia de API
Documentación detallada de la interfaz programática.

**Contenido**:
- Kernel API
- FileSystem API
- Environment API
- UserManager API
- Types & Interfaces
- Ejemplos prácticos

**Tiempo de lectura**: 25 minutos

---

### [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía de Contribución
Aprende cómo contribuir al proyecto.

**Contenido**:
- Código de conducta
- Cómo reportar bugs
- Cómo sugerir mejoras
- Guía de Pull Requests
- Guía de estilo
- Cómo agregar comandos

**Tiempo de lectura**: 20 minutos

---

## 📚 Estructura de la Documentación

```
docs/
├── INDEX.md                  # Este archivo
├── README.md                 # (raíz) Descripción general
├── GETTING_STARTED.md        # Inicio rápido para usuarios
├── COMMANDS.md               # Referencia de comandos
├── TROUBLESHOOTING.md        # Solución de problemas
├── ARCHITECTURE.md           # Diseño interno
├── API.md                    # Interfaz programática
└── CONTRIBUTING.md           # Guía para contribuidores
```

---

## 🎯 Guías por Caso de Uso

### "Acabo de instalar Terminal Simulator, ¿por dónde empiezo?"
👉 [GETTING_STARTED.md](./GETTING_STARTED.md)

### "¿Cómo uso el comando X?"
👉 [COMMANDS.md](./COMMANDS.md)

### "Algo no funciona, ¿qué hago?"
👉 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### "Quiero agregar un nuevo comando"
👉 [CONTRIBUTING.md](./CONTRIBUTING.md#agregar-comandos)

### "Quiero entender cómo funciona internamente"
👉 [ARCHITECTURE.md](./ARCHITECTURE.md)

### "Quiero usar Terminal Simulator en mi código"
👉 [API.md](./API.md)

### "Quiero contribuir con code, reportar bugs, o sugerir mejoras"
👉 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📖 Tiempo Total de Lectura

| Caso de Uso | Documentos | Tiempo |
|------------|-----------|--------|
| Usuario básico | GETTING_STARTED, COMMANDS | 30 min |
| Usuario avanzado | + TROUBLESHOOTING | 45 min |
| Desarrollador | ARCHITECTURE, API | 60 min |
| Contribuidor | Todo | 120 min |

---

## 🔍 Búsqueda Rápida

### Instalar y Ejecutar
- [GETTING_STARTED.md - Instalación Rápida](./GETTING_STARTED.md#instalación-rápida)
- [TROUBLESHOOTING.md - Problemas de Instalación](./TROUBLESHOOTING.md#problemas-de-instalación)

### Usar Comandos
- [COMMANDS.md - Todos los comandos](./COMMANDS.md)
- [GETTING_STARTED.md - Comandos Útiles](./GETTING_STARTED.md#comandos-útiles)

### Sistema de Archivos
- [GETTING_STARTED.md - Crear Archivos](./GETTING_STARTED.md#crear-archivos-y-directorios)
- [COMMANDS.md - Comandos de Archivos](./COMMANDS.md#comandos-de-archivos)
- [API.md - FileSystem API](./API.md#filesystem)

### Usuarios y Grupos
- [GETTING_STARTED.md - Gestión de Usuarios](./GETTING_STARTED.md#gestión-de-usuarios)
- [COMMANDS.md - Comandos de Usuarios](./COMMANDS.md#comandos-de-usuarios)
- [API.md - UserManager API](./API.md#usermanager)

### Desarrollo
- [ARCHITECTURE.md - Flujo de Ejecución](./ARCHITECTURE.md#flujo-de-ejecución-de-comando)
- [CONTRIBUTING.md - Agregar Comandos](./CONTRIBUTING.md#agregar-comandos)
- [API.md - Ejemplos Prácticos](./API.md#ejemplos-prácticos)

---

## 🏗️ Arquitectura de la Documentación

```
README.md (raíz)
    ↓
GETTING_STARTED.md (entrada)
    ├─→ COMMANDS.md (referencia)
    ├─→ TROUBLESHOOTING.md (problemas)
    └─→ INDEX.md (este documento)

ARCHITECTURE.md (desarrollo)
    ├─→ API.md (interfaz)
    └─→ CONTRIBUTING.md (contribuir)
```

---

## ✅ Checklist de Lectura

- [ ] Leí README.md
- [ ] Leí GETTING_STARTED.md
- [ ] Leí COMMANDS.md de los comandos que uso
- [ ] Leí TROUBLESHOOTING.md si tengo problemas
- [ ] Leí ARCHITECTURE.md para entender el sistema
- [ ] Leí API.md si quiero desarrollar
- [ ] Leí CONTRIBUTING.md si quiero aportar

---

## 📞 Soporte

Si no encuentras respuesta:

1. **Busca en la documentación** - Usa Ctrl+F
2. **Revisa los ejemplos** - Hay muchos casos de uso
3. **Abre una Issue** - En GitHub con detalles
4. **Contacta a los maintainers** - En la sección de Issues

---

## 🔄 Última Actualización

- **Versión de la documentación**: 1.0.0
- **Terminal Simulator**: 0.1.0
- **Fecha**: May 11, 2026

---

¿Lista para empezar? 🚀

👉 **Nuevo usuario?** → [GETTING_STARTED.md](./GETTING_STARTED.md)  
👉 **Desarrollador?** → [ARCHITECTURE.md](./ARCHITECTURE.md)  
👉 **Contribuidor?** → [CONTRIBUTING.md](./CONTRIBUTING.md)
