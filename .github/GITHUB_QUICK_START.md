# ⚡ Guía Rápida: Publicar en GitHub Privado

## Pasos Rápidos (5 minutos)

### 1. Preparar Git y pnpm

```powershell
# Como administrador en PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Instalar pnpm (si no lo tienes)
npm install -g pnpm

# Verificar
git --version
pnpm --version
```

### 2. Crear Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Name: `terminal-simulator`
3. **Privacy: Private** ⚠️
4. Click Create (sin inicializar con archivos)

### 3. En PowerShell (5 comandos)

```powershell
cd "e:\Proyectos Software\TerminalSimulator"

git init
git config user.email "tu@email.com"
git config user.name "Tu Nombre"
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USER/terminal-simulator.git
git push -u origin main
```

### 4. Instalar con pnpm

```powershell
pnpm install
```

---

## ✅ Verificar

```powershell
# Confirmar que está en GitHub
git remote -v

# Ver commits
git log --oneline

# Ver ramas
git branch
```

---

## 📝 Comandos Diarios con pnpm

```powershell
pnpm install          # Instalar deps
pnpm dev              # Desarrollo
pnpm build            # Compilar
pnpm test             # Tests
pnpm lint             # Lint
pnpm add <package>    # Instalar paquete
pnpm remove <package> # Desinstalar paquete
git add .
git commit -m "mensaje"
git push              # Subir cambios
```

---

## 🔐 Cambiar Usuario en Git (si es necesario)

```powershell
# Local (solo este proyecto)
git config user.email "tu@email.com"
git config user.name "Tu Nombre"

# Global (todos los proyectos)
git config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"
```

---

**¡Listo! Tu proyecto en GitHub privado con pnpm ✅**

Para más detalles: Ver [GITHUB_SETUP_GUIDE.md](./GITHUB_SETUP_GUIDE.md)
