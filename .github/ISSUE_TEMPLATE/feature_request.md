name: Feature Request
description: Sugerir una mejora o nueva característica
title: "[FEATURE] "
labels: ["enhancement"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        ¡Gracias por tu sugerencia!
  - type: textarea
    id: description
    attributes:
      label: Descripción de la Característica
      description: Descripción clara de qué propones
      placeholder: Mi idea es...
    validations:
      required: true
  - type: textarea
    id: motivation
    attributes:
      label: Motivación
      description: Por qué es importante esta característica
      placeholder: Esto sería útil para...
    validations:
      required: true
  - type: textarea
    id: alternative
    attributes:
      label: Alternativas Consideradas
      description: Otras formas de resolver el problema
      placeholder: También podrían...
    validations:
      required: false
