# Guía de Inicio Rápido

Empieza a usar Terminal Simulator en 5 minutos.

## Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd TerminalSimulator

# 2. Instalar dependencias
pnpm install

# 3. Iniciar servidor de desarrollo
pnpm dev

# 4. Abrir en navegador
# http://localhost:5173
```

## Tu Primer Comando

Una vez que la aplicación carga en el navegador:

```bash
$ whoami
root

$ pwd
/root

$ echo "¡Hola Terminal Simulator!"
¡Hola Terminal Simulator!
```

## Explorando el Sistema

### Listar Archivos

```bash
$ ls
bin  boot  etc  home  root  tmp  usr  var

$ ls -la
total 64
drwxr-xr-x  14 root root 4096 May  5  2024 .
...

$ ls /home
admin  developer  guest  test
```

### Navegar Directorios

```bash
# Ir al home
$ cd ~
$ pwd
/root

# Ir al directorio de usuario
$ cd /home/developer
$ pwd
/home/developer

# Ir atrás
$ cd ..
$ pwd
/home

# Ir a raíz
$ cd /
$ pwd
/
```

### Ver Archivos

```bash
$ cat /etc/hostname
ubuntu-server

$ cat /etc/os-release
NAME="Terminal Simulator"
VERSION="0.1.0"
```

## Gestión de Usuarios

### Ver Usuario Actual

```bash
$ whoami
root

$ id
uid=0(root) gid=0(root) groups=0(root)
```

### Cambiar de Usuario

```bash
$ su developer
Contraseña: **** (presiona Enter)
$ whoami
developer

$ exit
$ whoami
root
```

### Ver Usuarios Conectados

```bash
$ who
root      pts/0   May 11 14:30
developer pts/1   May 11 15:00
```

## Crear Archivos y Directorios

### Crear Directorio

```bash
$ mkdir /tmp/proyecto
$ ls /tmp
proyecto
```

### Crear Archivo

```bash
$ touch /tmp/proyecto/archivo.txt
$ ls -la /tmp/proyecto/
-rw-r--r-- 1 root root 0 May 11 archivo.txt
```

### Escribir en Archivo

```bash
$ echo "Contenido" > /tmp/proyecto/archivo.txt
$ cat /tmp/proyecto/archivo.txt
Contenido

$ echo "Más contenido" >> /tmp/proyecto/archivo.txt
$ cat /tmp/proyecto/archivo.txt
Contenido
Más contenido
```

## Operaciones de Texto

### Buscar en Archivos

```bash
$ grep "contenido" /tmp/proyecto/archivo.txt
Contenido
Más contenido

$ grep -i "CONTENIDO" /tmp/proyecto/archivo.txt
Contenido
Más contenido

$ cat /tmp/proyecto/archivo.txt | grep "Más"
Más contenido
```

## Historial de Comandos

### Ver Historial

```bash
$ history
1  whoami
2  pwd
3  cd /home
4  ls
5  touch archivo.txt

$ history -n 2
4  ls
5  touch archivo.txt
```

### Navegar Historial

Usa las flechas ⬆️ y ⬇️ en el input para navegar comandos anteriores.

```bash
$ # Presiona ⬆️
$ ls
$ # Presiona ⬆️ de nuevo
$ cd /home
$ # Presiona ⬇️
$ ls
```

## Variables de Entorno

### Ver Variables

```bash
$ env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
HOME=/root
USER=root
PWD=/root

$ echo $HOME
/root

$ echo $USER
root
```

### Usar Variables

```bash
$ echo "Mi home es $HOME"
Mi home es /root

$ cd $HOME
$ pwd
/root
```

## Ayuda y Documentación

### Ayuda General

```bash
$ help
Terminal Simulator - Commands Help

Available commands by category:
- System: clear, date, uptime, whoami, who, sudo, history, help, env
- Filesystem: ls, cd, pwd, mkdir, touch, cat, chmod, chown
- Users: adduser, deluser, su, groups, addgroup, delgroup
- Text: grep, cat

Type 'help <command>' for more information.
```

### Ayuda de Comando

```bash
$ help ls
ls - List directory contents
Uso: ls [OPTIONS] [RUTA]
Flags:
  -l   Formato largo (detalles)
  -a   Mostrar archivos ocultos
  -h   Tamaño legible
  -r   Orden inverso
```

## Pipes y Redirecciones

### Pipes (|)

Conecta comandos, la salida de uno es la entrada del siguiente.

```bash
$ cat /tmp/proyecto/archivo.txt | grep "Más"
Más contenido

$ echo -e "apple\nbanana\napple" | grep "apple"
apple
apple
```

### Redirección de Salida

**Sobrescribir (>)**:
```bash
$ echo "Nuevo contenido" > /tmp/archivo2.txt
$ cat /tmp/archivo2.txt
Nuevo contenido
```

**Añadir (>>)**:
```bash
$ echo "Línea adicional" >> /tmp/archivo2.txt
$ cat /tmp/archivo2.txt
Nuevo contenido
Línea adicional
```

## Información del Sistema

### Fecha y Hora

```bash
$ date
Sat May 11 2026 14:30:45 GMT+0200
```

### Tiempo de Actividad

```bash
$ uptime
up 2 days, 5 hours, 30 minutes
```

### Información del Sistema

```bash
$ echo "Usuario: $(whoami)"
Usuario: root

$ echo "Directorio: $(pwd)"
Directorio: /root
```

## Permisos

### Ver Permisos

```bash
$ ls -l /tmp/proyecto
total 8
-rw-r--r-- 1 root root 31 May 11 archivo.txt
```

Interpretación:
- `-` : archivo (d para directorio)
- `rw-` : permisos del owner
- `r--` : permisos del grupo
- `r--` : permisos de otros

### Cambiar Permisos

```bash
$ chmod 755 /tmp/proyecto/script.sh
$ ls -l /tmp/proyecto/script.sh
-rwxr-xr-x 1 root root 0 May 11 script.sh
```

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `clear` | Limpiar pantalla |
| `help` | Ayuda general |
| `echo "texto"` | Imprimir texto |
| `ls` | Listar archivos |
| `pwd` | Directorio actual |
| `cd` | Cambiar directorio |
| `mkdir` | Crear directorio |
| `touch` | Crear archivo |
| `cat` | Ver archivo |
| `grep` | Buscar en archivo |
| `whoami` | Usuario actual |
| `date` | Fecha/hora |
| `history` | Historial |

## Pasos Siguientes

1. **Explorar más comandos**: Ver [COMMANDS.md](./COMMANDS.md)
2. **Agregar comandos**: Ver [CONTRIBUTING.md](./CONTRIBUTING.md#agregar-comandos)
3. **Entender la arquitectura**: Ver [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **API programática**: Ver [API.md](./API.md)

## Solucionar Problemas

Si algo no funciona:

1. Abre la consola del navegador (F12)
2. Revisa los mensajes de error
3. Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. Abre un issue en GitHub

---

¡Disfruta usando Terminal Simulator! 🚀
