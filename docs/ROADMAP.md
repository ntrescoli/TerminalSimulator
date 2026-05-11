# Roadmap

Plan de desarrollo futuro de Terminal Simulator.

## Visión

Terminal Simulator aspira a ser un simulador de terminal Linux funcional, educativo e interactivo que:
- Enseña comandos de Linux de manera práctica
- Proporciona un ambiente seguro para experimentar
- Se extiende fácilmente con nuevos comandos
- Funciona completamente en el navegador

## Versión Actual

**v0.1.0** - MVP (Producto Mínimo Viable)

Características:
- ✅ 30+ comandos funcionales
- ✅ Sistema de archivos virtual
- ✅ Gestión de usuarios y permisos
- ✅ Pipes y redirecciones básicas
- ✅ Historial de comandos

---

## Roadmap por Fase

### Fase 1: Mejoras Inmediatas (v0.2.0) - Q3 2026

#### Nuevos Comandos
- [ ] `tail` - Ver últimas líneas de archivo
- [ ] `head` - Ver primeras líneas de archivo
- [ ] `wc` - Contar líneas, palabras, caracteres
- [ ] `sort` - Ordenar líneas
- [ ] `uniq` - Eliminar líneas duplicadas
- [ ] `find` - Buscar archivos
- [ ] `sed` - Editor de stream
- [ ] `awk` - Procesador de patrones
- [ ] `cp` - Copiar archivos
- [ ] `mv` - Mover/renombrar archivos
- [ ] `rm` - Eliminar archivos

#### Mejoras de UI
- [ ] Colores en output de comandos
- [ ] Soporte para ANSI colors
- [ ] Mejor formato de `ls -l`
- [ ] Indicador visual del usuario actual
- [ ] Autocompletado de comandos (Tab)

#### Mejoras de Sistema
- [ ] Redirección de entrada (`<`)
- [ ] Conectores AND (`&&`) y OR (`||`)
- [ ] Globbing básico (`*`, `?`)
- [ ] Aliases de usuario
- [ ] Función `source` para scripts básicos

---

### Fase 2: Características Avanzadas (v0.3.0) - Q4 2026

#### Sistema de Scripting
- [ ] Scripts de shell (`.sh`)
- [ ] Variables locales
- [ ] Bucles (`for`, `while`)
- [ ] Condicionales (`if`, `else`)
- [ ] Funciones definidas por usuario

#### Mejoras de Filesystem
- [ ] Links simbólicos (`ln -s`)
- [ ] Links duros (`ln`)
- [ ] Archivos especiales (devices, pipes)
- [ ] Montar sistemas de archivos virtuales

#### Nuevo Sistema de Configuración
- [ ] `.bashrc` personalizable
- [ ] Variables de sesión persistentes
- [ ] Configuración de colores
- [ ] Perfiles de usuario

#### Comandos Adicionales
- [ ] `ln` - Crear links
- [ ] `file` - Determinar tipo de archivo
- [ ] `stat` - Ver estadísticas de archivos
- [ ] `mount`/`umount` - Montar sistemas
- [ ] `ps` - Procesos en ejecución
- [ ] `kill` - Terminar procesos
- [ ] `which` - Localizar comando
- [ ] `alias` - Definir aliases

---

### Fase 3: Experiencia Educativa (v0.4.0) - Q1 2027

#### Modo Tutorial
- [ ] Lecciones interactivas
- [ ] Ejercicios prácticos
- [ ] Validación automática
- [ ] Sistema de logros/badges

#### Documentación Integrada
- [ ] `man` - Manual pages integradas
- [ ] Info comandos mejorada
- [ ] Ejemplos en línea
- [ ] Búsqueda de ayuda

#### Características Educativas
- [ ] Sandbox seguro
- [ ] Desafíos diarios
- [ ] Progreso guardado
- [ ] Estadísticas de uso

---

### Fase 4: Integraciones (v0.5.0) - Q2 2027

#### Persistencia
- [ ] Almacenamiento en LocalStorage
- [ ] Exportar/importar configuración
- [ ] Sincronización en la nube
- [ ] Historial persistente

#### Compartición
- [ ] Generar URLs compartibles
- [ ] Snapshots de sesión
- [ ] Exportar transcripción
- [ ] Compartir configuración

#### Integraciones
- [ ] API REST para extensiones
- [ ] Plugins del navegador
- [ ] Integración con GitHub Gists
- [ ] Sincronización con gists locales

---

### Fase 5: Rendimiento y Escalabilidad (v1.0.0+)

#### Optimizaciones
- [ ] Web Workers para comandos pesados
- [ ] Caché de filesystem
- [ ] Compresión de historial
- [ ] Indexación de archivos

#### Escalabilidad
- [ ] Soporte para proyectos grandes
- [ ] Base de datos virtual
- [ ] Streaming de archivos

---

## Características Consideradas (Backlog)

### Comandos Avanzados
- `tmux` - Multiplexor de terminal
- `git` - Control de versiones
- `docker` - Containerización
- `vim` - Editor de texto
- `nano` - Editor simple

### Características del Sistema
- Variables de ambiente avanzadas
- Servicios/daemons
- Instalador de paquetes (`apt`, `npm`)
- Networking básica (`ping`, `curl`, `wget`)
- Cron jobs

### Seguridad
- Sandboxing mejorado
- Restricciones de permisos más reales
- Audit logs
- Contraseñas (básico)

---

## Decisiones de Diseño

### Por Qué No Incluir Ahora

1. **Vim/Editor Visual**: Complejidad vs. beneficio
2. **Networking Real**: Fuera de scope de terminal local
3. **Systemd**: Demasiado complejo para v1.0
4. **Completa POSIX**: Aproximación suficiente para educación

### Prioridades de Desarrollo

1. **Usabilidad**: Mejor experiencia de usuario
2. **Cobertura de comandos**: Más comandos útiles
3. **Educación**: Tutorial y guías
4. **Persistencia**: Guardar progreso

---

## Contribuciones Bienvenidas

Puedes ayudar en el roadmap:

1. **Implementar características planeadas**: Ver [CONTRIBUTING.md](./CONTRIBUTING.md)
2. **Sugerir nuevas funciones**: Abre una Issue
3. **Reportar bugs**: Help us improve
4. **Mejorar documentación**: Siempre bienvenido

---

## Timeline Estimado

| Versión | Fecha | Características Principales |
|---------|-------|---------------------------|
| 0.1.0 | May 2026 | MVP - Comandos básicos |
| 0.2.0 | Sep 2026 | Más comandos, UI mejorada |
| 0.3.0 | Dec 2026 | Scripting, configuración |
| 0.4.0 | Mar 2027 | Sistema educativo |
| 0.5.0 | Jun 2027 | Persistencia e integraciones |
| 1.0.0 | Sep 2027 | Versión estable final |

*Nota: Las fechas son estimadas y pueden cambiar según el progreso del desarrollo.*

---

## Votación de Características

¿Te interesa una característica específica? 

Vota en las Issues existentes o crea una nueva para sugerir lo que te gustaría ver.

Los comandos/features más votados serán priorizados en el próximo ciclo de desarrollo.

---

## Meta del Proyecto

Objetivo final: **Simulador de terminal Linux completo, educativo y extensible que corra en el navegador**.

Cambiar: "Cuando necesite practicar Linux, iré a una máquina virtual" 
Por: "Abriré Terminal Simulator en mi navegador"

---

*Última actualización: May 11, 2026*

¿Preguntas sobre el roadmap? Abre una Issue en GitHub.
