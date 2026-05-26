# Guía de Deploy

## Publicar en npm

### Requisitos

- Acceso a npm registry
- Versión local actualizada
- Tests pasando

### Pasos

1. **Actualiza la versión en package.json**

```bash
# Patch (0.1.0 -> 0.1.1)
npm version patch

# Minor (0.1.0 -> 0.2.0)
npm version minor

# Major (0.1.0 -> 1.0.0)
npm version major
```

2. **Compila y verifica**

```bash
pnpm lint
pnpm test
pnpm build
```

3. **Publica en npm**

```bash
npm publish
```

4. **Verifica**

```bash
npm info terminal-simulator
```

## Deploy de la Aplicación

### GitHub Pages

1. Activa GitHub Pages en `Settings > Pages`
2. Selecciona la rama `main` y carpeta `/dist`
3. Actualiza el `homepage` en package.json:

```json
"homepage": "https://yourusername.github.io/terminal-simulator"
```

4. Deploy automático al pushear:

```bash
git push origin main
```

### Vercel

1. Conecta tu repositorio en Vercel
2. Framework: `Vite`
3. Build: `pnpm build`
4. Output: `dist`

### Netlify

1. Conecta el repositorio en Netlify
2. Build command: `pnpm build`
3. Publish directory: `dist`

## Versioning

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles (API breaking)
- **MINOR**: Nuevas características compatibles
- **PATCH**: Fixes de bugs

Ejemplos:

```
1.0.0       # Primera versión estable
1.1.0       # Nueva característica
1.1.1       # Bug fix
2.0.0       # Breaking change
```

## Checklist Pre-Release

- [ ] Todos los tests pasan
- [ ] ESLint sin errores
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado
- [ ] Versión actualizada en package.json
- [ ] Cambios commiteados y pusheados
- [ ] GitHub Release creado
