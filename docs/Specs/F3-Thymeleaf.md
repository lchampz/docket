---
fase: 3
estado: fechada
depende: [F2]
---

# F3 · Thymeleaf

**Objetivo** — CRUD de cartórios server-rendered em `/cartorios`, cumprindo literalmente o requisito obrigatório do desafio backend.

**Contexto necessário** — `Contexto/Arquitetura.md` (§ Duas superfícies), `Contexto/Decisoes.md` D5

## Tarefas

- [x] `[subagent]` Layout base com fragments Thymeleaf (`layout.html`, `_head`, `_nav`)
- [x] `[subagent]` `GET /cartorios` — tabela paginada com nome, endereço e contagem de documentos emitidos
- [x] `[subagent]` `GET /cartorios/novo` e `/{id}/editar` — form com bind de `@ModelAttribute` e multi-select de documentos
- [x] `[subagent]` `POST` / `PUT` com `BindingResult`, reexibindo erros de campo
- [x] `[subagent]` `POST /{id}/excluir` com confirmação
- [x] `[subagent]` Flash messages de sucesso e erro via `RedirectAttributes`
- [x] `[agent]` Confirmar que os controllers usam o **mesmo** `CartorioService` do REST — nenhuma regra reimplementada
- [x] `[agent]` CSS mínimo, legível, sem framework. Esta tela é prova de requisito, não vitrine.

## Critério de aceite

- Ciclo completo pelo navegador: listar → cadastrar → editar → excluir, com feedback visível.
- Submeter form vazio reexibe a página com os erros por campo, sem perder o que foi digitado.
- Nenhuma regra de negócio duplicada entre `web/` e os services.

## Armadilhas

- Navegador não faz `PUT`/`DELETE` em form. Ou `_method` com `HiddenHttpMethodFilter`, ou `POST` em rota explícita — escolher um e ser consistente.
