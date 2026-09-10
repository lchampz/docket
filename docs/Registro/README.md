# Registro

Um arquivo por fase fechada: `F0.md`, `F1.md`, … Serve para uma sessão futura saber o que aconteceu **sem ler o diff**.

## Template

```markdown
# F<n> · <nome>

**Fechada em** AAAA-MM-DD

## Feito
- ...

## Mudou de rumo
- O que a spec dizia, o que foi feito, por quê.

## Quebrou
- Problema, causa, correção. Se ficou pendente, diz onde.

## Sobrou para depois
- ...
```

Decisão que sobrevive à fase migra para `Contexto/Decisoes.md`. O resto morre aqui, de propósito.
