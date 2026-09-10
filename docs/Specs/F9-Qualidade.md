---
fase: 9
estado: fechada
depende: [F8]
---

# F9 · Qualidade

**Objetivo** — Provar que funciona, não afirmar.

**Contexto necessário** — `Contexto/Dominio.md` § Regras

## Tarefas

### Backend
- [x] `[subagent]` Teste unitário do validador de CPF/CNPJ — válidos, dígito errado, sequência repetida, tamanho errado
- [x] `[subagent]` Teste de service: par cartório/documento inválido, coerência de tipo de pessoa, status inicial forçado
- [x] `[subagent]` `@WebMvcTest` dos controllers — códigos de status e forma do `ProblemDetail`
- [x] `[agent]` Integração com Testcontainers: migrations + fluxo completo de agendamento contra Postgres real
- [x] `[agent]` Teste que falha se a listagem de agendamentos voltar a fazer N+1

### Frontend
- [x] `[subagent]` Teste dos hooks de máscara, incluindo edição no meio do campo
- [x] `[subagent]` Teste do combo condicional: trocar cartório limpa documento inválido
- [x] `[subagent]` Teste de schema zod contra payloads válidos e inválidos

### Transversal
- [x] `[agent]` Passada de responsividade em 360, 768, 1024, 1440
- [x] `[agent]` Passada de semântica e a11y: landmarks, labels, foco visível, contraste, `aria-live`
- [x] `[subagent]` Lint e formatação nos dois lados, rodando em script único

## Critério de aceite

- Suíte verde em container limpo, sem depender de banco da máquina.
- Cada regra de `Dominio.md` tem ao menos um teste que falha se ela for removida.
- Nenhum erro crítico de a11y nas telas principais.
- Nada quebrado em 360px.

## Armadilhas

- Teste de integração que sobe o contexto Spring inteiro por classe fica lento. Reaproveitar o container.
- Cobertura alta com asserção fraca é pior que pouco teste, porque mente.
