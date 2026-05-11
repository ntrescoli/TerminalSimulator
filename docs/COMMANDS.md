# Referencia de Comandos

Documentación completa de todos los comandos disponibles en Terminal Simulator.

## Tabla de Contenidos

- [Comandos del Sistema](#comandos-del-sistema)
- [Comandos de Archivos](#comandos-de-archivos)
- [Comandos de Texto](#comandos-de-texto)
- [Comandos de Usuarios](#comandos-de-usuarios)

---

## Comandos del Sistema

### `clear`

Limpia la pantalla del terminal.

```
Uso: clear
Alias: c
Flags: ninguno
```

**Ejemplo**:
```bash
$ clear
```

---

### `echo`

Imprime un texto en la salida.

```
Uso: echo [OPTIONS] [TEXT]
Alias: echo
Flags:
  -n   No añadir salto de línea al final
  -e   Interpretar escapes de barra invertida
```

**Ejemplos**:
```bash
$ echo "Hola Mundo"
Hola Mundo

$ echo -n "Sin salto"
Sin salto$ 

$ echo "Línea 1\nLínea 2"
Línea 1
Línea 2
```

---

### `date`

Muestra la fecha y hora actual del sistema.

```
Uso: date [OPTIONS]
Alias: date
Flags: ninguno
```

**Ejemplo**:
```bash
$ date
Sat May 11 2026 14:30:45 GMT+0200
```

---

### `uptime`

Muestra el tiempo de funcionamiento del sistema desde su inicio.

```
Uso: uptime
Alias: uptime
Flags: ninguno
```

**Ejemplo**:
```bash
$ uptime
up 2 days, 5 hours, 30 minutes
```

---

### `who`

Lista los usuarios conectados al sistema.

```
Uso: who [OPTIONS]
Alias: who
Flags: ninguno
```

**Ejemplo**:
```bash
$ who
root      pts/0   May 11 14:30
usuario   pts/1   May 11 15:00
```

---

### `whoami`

Muestra el usuario actual.

```
Uso: whoami
Alias: whoami
Flags: ninguno
```

**Ejemplo**:
```bash
$ whoami
root
```

---

### `sudo`

Ejecuta un comando como usuario root (superusuario).

```
Uso: sudo [COMANDO] [ARGUMENTOS]
Alias: sudo
Flags: ninguno
Requisito: Usuario debe estar en grupo sudoers
```

**Ejemplo**:
```bash
$ sudo useradd nuevouser
```

---

### `history`

Muestra el historial de comandos ejecutados.

```
Uso: history [OPTIONS]
Alias: h
Flags:
  -c   Limpiar el historial
  -n   Mostrar últimos N comandos
```

**Ejemplos**:
```bash
$ history
1  ls
2  cd /home
3  pwd
4  echo "test"

$ history -n 2
3  pwd
4  echo "test"
```

---

### `help`

Muestra ayuda general o sobre un comando específico.

```
Uso: help [COMANDO]
Alias: help, h, ?
Flags: ninguno
```

**Ejemplos**:
```bash
$ help
Terminal Simulator - Commands Help
...

$ help ls
ls - List directory contents
...
```

---

### `env`

Muestra las variables de entorno actuales.

```
Uso: env [OPTIONS]
Alias: env
Flags:
  -a   Mostrar todas las variables
```

**Ejemplo**:
```bash
$ env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
HOME=/root
USER=root
PWD=/root
```

---

## Comandos de Archivos

### `ls`

Lista el contenido de un directorio.

```
Uso: ls [OPTIONS] [RUTA]
Alias: ls
Flags:
  -l   Formato largo (detalles)
  -a   Mostrar archivos ocultos
  -h   Tamaño en formato legible
  -r   Orden inverso
```

**Ejemplos**:
```bash
$ ls
archivo.txt  directorio/  otro.txt

$ ls -l
-rw-r--r-- 1 root root 1234 May 11 archivo.txt
drwxr-xr-x 2 root root 4096 May 11 directorio

$ ls -la /home
total 16
drwxr-xr-x  3 root root 4096 May  5  2024 .
drwxr-xr-x  3 root root 4096 May  5  2024 ..
-rw-r--r--  1 root root 1234 May  5  2024 .bashrc
```

---

### `cd`

Cambia el directorio actual.

```
Uso: cd [RUTA]
Alias: cd
Flags: ninguno
```

**Ejemplos**:
```bash
$ cd /home
$ pwd
/home

$ cd ..
$ pwd
/

$ cd ~
$ pwd
/root
```

---

### `pwd`

Imprime el directorio de trabajo actual (camino absoluto).

```
Uso: pwd
Alias: pwd
Flags: ninguno
```

**Ejemplo**:
```bash
$ pwd
/home/usuario
```

---

### `mkdir`

Crea un nuevo directorio.

```
Uso: mkdir [OPTIONS] [NOMBRE]
Alias: mkdir
Flags:
  -p   Crear directorios padres si es necesario
```

**Ejemplos**:
```bash
$ mkdir nuevodirectorio

$ mkdir -p /path/to/deep/directory
```

---

### `touch`

Crea un archivo vacío o actualiza su timestamp.

```
Uso: touch [NOMBRE]
Alias: touch
Flags: ninguno
```

**Ejemplos**:
```bash
$ touch archivo.txt

$ touch /home/usuario/documento.md
```

---

### `cat`

Muestra el contenido de un archivo o concatena múltiples archivos.

```
Uso: cat [ARCHIVO] [ARCHIVO2] ...
Alias: cat
Flags:
  -n   Mostrar números de línea
```

**Ejemplos**:
```bash
$ cat archivo.txt
Contenido del archivo

$ cat archivo1.txt archivo2.txt
Contenido 1
Contenido 2

$ cat -n archivo.txt
1  Primera línea
2  Segunda línea
```

---

### `chmod`

Cambia los permisos de un archivo o directorio.

```
Uso: chmod [PERMISOS] [ARCHIVO]
Alias: chmod
Formato de permisos: rwx (lectura, escritura, ejecución)
```

**Ejemplos**:
```bash
$ chmod 755 script.sh
$ chmod u+rw,g+r archivo.txt
$ chmod a-x archivo.txt
```

---

### `chown`

Cambia el propietario de un archivo o directorio.

```
Uso: chown [USUARIO]:[GRUPO] [ARCHIVO]
Alias: chown
Requisito: Ser root
```

**Ejemplos**:
```bash
$ chown usuario archivo.txt
$ chown usuario:grupo archivo.txt
```

---

## Comandos de Texto

### `grep`

Busca líneas que coincidan con un patrón en archivos.

```
Uso: grep [OPTIONS] [PATRÓN] [ARCHIVO]
Alias: grep
Flags:
  -i   Búsqueda insensible a mayúsculas
  -v   Mostrar líneas que NO coincidan
  -n   Mostrar números de línea
  -c   Contar coincidencias
```

**Ejemplos**:
```bash
$ grep "texto" archivo.txt
Línea que contiene texto

$ grep -n "error" log.txt
5:Error en línea 5
8:Error en línea 8

$ grep -i "LINUX" archivo.txt
linux, LINUX, Linux (todas coinciden)
```

---

### `cat`

Ver [Comandos de Archivos](#comandos-de-archivos) para documentación de `cat`.

---

## Comandos de Usuarios

### `adduser`

Agrega un nuevo usuario al sistema.

```
Uso: adduser [OPCIONES] [NOMBRE_USUARIO]
Alias: adduser
Flags:
  --uid UID         Especificar UID
  --home RUTA       Especificar directorio home
  --shell SHELL     Especificar shell
  --group GRUPO     Grupo primario
```

**Ejemplos**:
```bash
$ adduser juanperez
$ adduser --home /home/trabajador --shell /bin/bash trabajador
```

---

### `deluser`

Elimina un usuario del sistema.

```
Uso: deluser [OPCIONES] [NOMBRE_USUARIO]
Alias: deluser
Flags:
  --remove-home   Eliminar directorio home
```

**Ejemplos**:
```bash
$ deluser juanperez
$ deluser --remove-home usuario_antiguo
```

---

### `useradd`

Alternativa a `adduser` para agregar usuarios (compatible con Linux).

```
Uso: useradd [OPCIONES] [NOMBRE_USUARIO]
Alias: useradd
Flags:
  -u UID            UID
  -d RUTA          Directorio home
  -s SHELL         Shell
  -g GRUPO         Grupo
```

**Ejemplo**:
```bash
$ useradd -u 1001 -d /home/nuevo -s /bin/bash nuevo
```

---

### `su`

Cambia el usuario actual.

```
Uso: su [USUARIO]
Alias: su
Flags: ninguno
Requisito: Conocer contraseña del usuario
```

**Ejemplos**:
```bash
$ su root
Contraseña: ****
root@ubuntu:~#

$ su usuario
Contraseña: ****
usuario@ubuntu:~$
```

---

### `addgroup`

Agrega un nuevo grupo al sistema.

```
Uso: addgroup [OPCIONES] [NOMBRE_GRUPO]
Alias: addgroup
Flags:
  --gid GID   Especificar GID
```

**Ejemplos**:
```bash
$ addgroup desarrolladores
$ addgroup --gid 1000 administradores
```

---

### `delgroup`

Elimina un grupo del sistema.

```
Uso: delgroup [NOMBRE_GRUPO]
Alias: delgroup
Flags: ninguno
```

**Ejemplo**:
```bash
$ delgroup desarrolladores
```

---

### `groups`

Muestra los grupos a los que pertenece un usuario.

```
Uso: groups [USUARIO]
Alias: groups
Flags: ninguno
```

**Ejemplos**:
```bash
$ groups
sudo adm cdrom sudo dialout

$ groups usuario
desarrolladores sistemas
```

---

## Características Avanzadas

### Pipes (`|`)

Encadena comandos, pasando la salida de uno como entrada al siguiente.

**Ejemplo**:
```bash
$ cat archivo.txt | grep "error" | grep -v "warning"
```

### Redirecciones

#### Sobrescribir (`>`)
```bash
$ echo "contenido" > archivo.txt
```

#### Añadir (`>>`)
```bash
$ echo "otra línea" >> archivo.txt
```

### Variables de Entorno

Usa variables con `$NOMBRE`:

```bash
$ echo $HOME
/root

$ echo $USER
root

$ export MIVAR="valor"
$ echo $MIVAR
valor
```

---

## Tabla Rápida

| Comando | Descripción | Alias |
|---------|-------------|-------|
| `clear` | Limpiar pantalla | `c` |
| `echo` | Imprimir texto | - |
| `date` | Fecha y hora | - |
| `uptime` | Tiempo de actividad | - |
| `who` | Usuarios conectados | - |
| `whoami` | Usuario actual | - |
| `sudo` | Ejecutar como root | - |
| `history` | Historial de comandos | `h` |
| `help` | Ayuda | `?` |
| `env` | Variables de entorno | - |
| `ls` | Listar directorio | - |
| `cd` | Cambiar directorio | - |
| `pwd` | Directorio actual | - |
| `mkdir` | Crear directorio | - |
| `touch` | Crear archivo | - |
| `cat` | Mostrar archivo | - |
| `chmod` | Cambiar permisos | - |
| `chown` | Cambiar propietario | - |
| `grep` | Buscar patrón | - |
| `adduser` | Agregar usuario | - |
| `deluser` | Eliminar usuario | - |
| `useradd` | Agregar usuario (alt) | - |
| `su` | Cambiar usuario | - |
| `addgroup` | Agregar grupo | - |
| `delgroup` | Eliminar grupo | - |
| `groups` | Ver grupos | - |
