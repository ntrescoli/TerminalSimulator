# 📤 Subir a GitHub - Pasos Finales

## ⚠️ Requisito: Instalar Git

Git no está instalado en tu sistema. Necesitas instalarlo primero.

### Opción 1: Instalador oficial (Recomendado)

1. Descarga desde: **[git-scm.com](https://git-scm.com)**
2. Ejecuta el instalador `.exe`
3. Acepta los valores por defecto
4. En "Default editor", selecciona **Nano** o **Vim** (no VS Code para instalación rápida)
5. Completa la instalación
6. **Reinicia PowerShell** para que reconozca git

### Opción 2: Instalador Chocolatey (si lo tienes)

```powershell
choco install git
```

### Opción 3: Instalador Scoop

```powershell
scoop install git
```

---

## ✅ Una vez instalado Git

### Opción A: Ejecutar Script (Más Fácil)

**Para PowerShell:**

1. Abre PowerShell
2. Ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd "e:\Proyectos Software\TerminalSimulator"
.\push-to-github.ps1
```

**Para CMD:**

1. Abre CMD
2. Ejecuta:
```cmd
cd "e:\Proyectos Software\TerminalSimulator"
push-to-github.bat
```

### Opción B: Comandos Manuales (Más Control)

```powershell
cd "e:\Proyectos Software\TerminalSimulator"

git init
git config user.email "ntrescoli@gmail.com"
git config user.name "ntrescoli"
git add .
git commit -m "Initial commit: Terminal Simulator as NPM package ready"
git branch -M main
git remote add origin https://github.com/ntrescoli/terminal-simulator.git
git push -u origin main
```

---

## 🔍 Verificar que Funcionó

```powershell
git remote -v
# Debe mostrar:
# origin  https://github.com/ntrescoli/terminal-simulator.git (fetch)
# origin  https://github.com/ntrescoli/terminal-simulator.git (push)

git log --oneline
# Debe mostrar tu commit inicial
```

---

## ✨ Después del Push

```powershell
# Instalar dependencias con pnpm
pnpm install

# Iniciar desarrollo
pnpm dev

# Para futuros cambios
git add .
git commit -m "Descripción del cambio"
git push
```

---

## 🆘 Solución de Problemas

### "Git no se reconoce"
- Verificate que reiniciaste PowerShell después de instalar git
- O prueba con CMD

### "authentication failed"
- Usa este comando para guardar credenciales:
```powershell
git config --global credential.helper wincred
```
- Luego intenta el push de nuevo

### "fatal: repository already exists"
- Si ya existe `.git/`, ejecuta:
```powershell
rm -Force -Recurse .git
```
- Luego intenta de nuevo

---

## 📋 Checklist

- [ ] Descargué e instalé git desde git-scm.com
- [ ] Reinicié PowerShell
- [ ] Verifiqué `git --version`
- [ ] Creé repositorio privado en GitHub
- [ ] Ejecuté el script o los comandos manuales
- [ ] Vi el mensaje "✅ ¡Proyecto subido a GitHub!"
- [ ] Verifiqué en https://github.com/ntrescoli/terminal-simulator

---

## 🚀 ¡Listo!

Una vez que git esté instalado y el push completado:

```powershell
pnpm install
pnpm dev
```

¡Tu proyecto estará corriendo en http://localhost:5173! 🎉
