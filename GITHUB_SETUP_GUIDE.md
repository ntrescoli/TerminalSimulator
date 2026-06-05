# 🚀 Guía: Configurar GitHub Privado con pnpm

## 1️⃣ Verificar pnpm (en PowerShell o CMD)

```powershell
# Abre PowerShell como Administrador y ejecuta:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Luego verifica pnpm
pnpm --version
```

Si no lo tienes, instálalo:
```powershell
npm install -g pnpm
```

---

## 2️⃣ Inicializar Git Localmente

```powershell
cd "e:\Proyectos Software\TerminalSimulator"

# Inicializar repositorio (si no está hecho)
git init

# Configurar información de usuario (reemplaza con tus datos)
git config user.email "tu-email@example.com"
git config user.name "Tu Nombre"

# Ver estado
git status
```

---

## 3️⃣ Crear Repositorio en GitHub (Privado)

### Paso 1: En GitHub
1. Ve a [github.com/new](https://github.com/new)
2. **Repository name:** `terminal-simulator`
3. **Description:** `Interactive Linux terminal simulator for the browser - React & Vanilla JS component`
4. **Privacy:** Selecciona **Private** ⚠️
5. **Do NOT initialize** (marca "Skip this step" para README, .gitignore, license)
6. Click en **Create repository**

### Paso 2: Copiar la URL SSH o HTTPS
Después de crear, GitHub te mostrará:
```
git remote add origin git@github.com:TU_USUARIO/terminal-simulator.git
```
O si usas HTTPS:
```
git remote add origin https://github.com/TU_USUARIO/terminal-simulator.git
```

---

## 4️⃣ Agregar Archivos y Hacer Primer Commit

```powershell
cd "e:\Proyectos Software\TerminalSimulator"

# Agregar todos los archivos (excepto los de .gitignore)
git add .

# Ver qué se agregó
git status

# Hacer commit
git commit -m "Initial commit: Terminal Simulator as NPM package ready"

# Ver el historial
git log --oneline
```

---

## 5️⃣ Conectar Repositorio Remoto y Push

```powershell
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/terminal-simulator.git

# Si usas SSH (requiere key configurada)
# git remote add origin git@github.com:TU_USUARIO/terminal-simulator.git

# Cambiar rama a main (estándar en GitHub)
git branch -M main

# Hacer push por primera vez
git push -u origin main

# Siguiente pushes (más simple)
git push
```

---

## 6️⃣ Usar pnpm en el Proyecto

### Instalar dependencias con pnpm:
```powershell
cd "e:\Proyectos Software\TerminalSimulator"
pnpm install
```

### Comandos principales:

```powershell
# Desarrollo
pnpm dev

# Build
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Publicar (más adelante)
pnpm publish
```

---

## ✅ Checklist

- [ ] Ejecuté `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` en PowerShell como admin
- [ ] Tengo git instalado (`git --version`)
- [ ] Tengo pnpm instalado (`pnpm --version`)
- [ ] Creé repositorio privado en GitHub
- [ ] Copié la URL del repositorio (SSH o HTTPS)
- [ ] Estoy en la carpeta correcta (`e:\Proyectos Software\TerminalSimulator`)
- [ ] Ejecuté `git init`
- [ ] Ejecuté `git config user.email` y `git config user.name`
- [ ] Ejecuté `git add .`
- [ ] Ejecuté `git commit -m "Initial commit..."`
- [ ] Ejecuté `git remote add origin ...` con mi URL
- [ ] Ejecuté `git push -u origin main`
- [ ] Ejecuté `pnpm install`

---

## 🔐 Configurar SSH (Opcional pero Recomendado)

Si prefieres SSH en lugar de HTTPS:

```powershell
# Generar key SSH
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Presiona Enter 3 veces para usar valores por defecto

# Ver tu clave pública
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard

# Ir a GitHub → Settings → SSH and GPG keys → New SSH key
# Pegar la clave y guardar
```

---

## 🆘 Solución de Problemas

### Error: "git: El término no se reconoce"
**Solución:** Git no está instalado. Descárgalo de [git-scm.com](https://git-scm.com)

### Error: "fatal: not a git repository"
**Solución:** Asegúrate de estar en la carpeta correcta y haber ejecutado `git init`

### Error: "authentication failed"
**Solución:** 
- Si usas HTTPS: Verifica tu contraseña de GitHub
- Si usas SSH: Asegúrate de haber agregado la clave SSH a GitHub

### Error: "pathspec 'main' did not match any file"
**Solución:** Ejecuta `git branch -M main` antes del push

### pnpm: "Cannot find module"
**Solución:** Ejecuta `pnpm install` para instalar todas las dependencias

---

## 📝 Próximos Pasos

1. **Proteger la rama main** (en GitHub):
   - Settings → Branches → Add rule
   - Requiere pull request reviews antes de merge

2. **Crear `.github/workflows/`** para CI/CD (opcional)
   - Tests automáticos en cada push
   - Build automático

3. **Configurar GitHub Pages** (si quieres demo online):
   - Settings → Pages
   - Source: GitHub Actions

4. **Agregar colaboradores** (si trabajas en equipo):
   - Settings → Collaborators
   - Invitar usuarios

---

**¡Listo para trabajar con GitHub privado y pnpm!** 🎉
