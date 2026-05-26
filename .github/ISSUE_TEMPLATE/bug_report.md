name: Bug Report
description: Reportar un bug o problema
title: "[BUG] "
labels: ["bug"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out a bug report!
  - type: textarea
    id: description
    attributes:
      label: Descripción del Bug
      description: Descripción clara y concisa del problema
      placeholder: Qué está mal...
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Pasos para Reproducir
      description: Pasos específicos para reproducir el problema
      placeholder: |
        1. Ir a...
        2. Hacer clic en...
        3. Ver error...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Comportamiento Esperado
      description: Qué debería suceder
      placeholder: Descripción clara...
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Comportamiento Actual
      description: Qué sucede realmente
      placeholder: Descripción clara...
    validations:
      required: true
  - type: dropdown
    id: browser
    attributes:
      label: Navegador
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - Otro
    validations:
      required: true
  - type: dropdown
    id: os
    attributes:
      label: Sistema Operativo
      options:
        - Windows
        - macOS
        - Linux
        - Otro
    validations:
      required: true
  - type: textarea
    id: additional
    attributes:
      label: Información Adicional
      description: Cualquier contexto relevante
      placeholder: Capturas de pantalla, logs, etc...
