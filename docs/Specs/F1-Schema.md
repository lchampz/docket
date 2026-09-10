---
fase: 1
estado: fechada
depende: [F0]
---

# F1 · Schema

**Objetivo** — Banco modelado, migrado e semeado. Nenhum endpoint ainda.

**Contexto necessário** — `Contexto/Dominio.md`

## Tarefas

- [x] `[agent]` Revisar `Dominio.md` contra o layout uma última vez antes de congelar o schema
- [x] `[subagent]` `V1__create_tables.sql`: as 5 tabelas com PK, FK, `NOT NULL`, `UNIQUE`
- [x] `[subagent]` `V2__constraints.sql`: `CHECK length(documento_identificacao) IN (11,14)`, `CHECK uf` com 2 caracteres, índice único parcial de duplicata ativa
- [x] `[subagent]` `V3__indexes.sql`: índices de FK e de `agendamento(pedido_id, created_at)`
- [x] `[agent]` `R__seed.sql`: 1 pedido, ~4 cartórios reais com CEP válido, ~6 documentos (certidões de nascimento/casamento/óbito e afins), vínculos N:N **desiguais** — cartório que não emite tudo é o que exercita o combo condicional
- [x] `[subagent]` Entidades JPA das 5 tabelas com `@Enumerated(STRING)` e auditoria (`@CreatedDate`/`@LastModifiedDate`)
- [x] `[subagent]` Repositories Spring Data, um por agregado
- [x] `[agent]` Conferir que o mapeamento JPA bate com as migrations — `ddl-auto: validate`, nunca `update`

## Critério de aceite

- `docker compose up` do zero migra sem erro e sobe a aplicação.
- `\dt` lista as 5 tabelas; seed populado.
- Inserir CPF com 10 dígitos direto no psql é **recusado** pelo CHECK.
- Inserir agendamento com par cartório/documento inexistente ainda passa no banco — a regra é de serviço, não de constraint. Confirmar que é intencional.

## Armadilhas

- `ddl-auto: update` mascara divergência entre entidade e migration e explode em produção. `validate`, sempre.
- Seed em `R__` (repetível) roda toda vez que o checksum muda. Se precisar ser idempotente, `ON CONFLICT DO NOTHING`.
