Punto de entrada -> index.html (+estilos -> style.css) + (+interactividad -> main.ts)

main.ts:
- Gestiona la pulsación de teclas: ⬆️, ⬇️, enter
- Inicializa el Kernel (funciones)
- Inicializa el UI (vista)

/ui

Terminal.ts:
- Pinta la pantalla
- Recibe el texto
- Escribe respuesta
- Gestiona el contenido del prompt

/types

intex.ts: (Se fusionará en el futuro con types.ts)
- Guarda la clase y la interfaz para describir cómo es un nodo (file, dir)

types.ts:
- Guarda la clase y la interfaz para describir cómo es un comando y sus flags, ruta, etc.

/core -> variables y funciones auxiliares para ser usadas por las librerias de comandos

Kernel.ts:
- Importa y registra los comandos

Environment.ts
- Contiene las variables de entorno y sus getters y setters

FileSystem.ts
- Contiene funciones auxiliares para ser utilizadas por los comandos

/commands -> donde se añaden las librerias de comandos

basic.ts:
- contiene los comandos básicos del sistema. Recurre a Environment.ts y FileSystem.ts para usar sus funciones.

filesystem.ts:
- contiene los comandos del sistema de archivos. Recurre a Environment.ts y FileSystem.ts para usar sus funciones.
