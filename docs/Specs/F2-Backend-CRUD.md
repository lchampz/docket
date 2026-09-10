---
fase: 2
estado: fechada
depende: [F1]
---

# F2 · CRUD backend

**Objetivo** — Contrato REST inteiro no ar, validado e documentado.

**Contexto necessário** — `Contexto/Contrato-API.md`, `Contexto/Dominio.md`, `Contexto/Arquitetura.md`

## Tarefas

### Fundação
- [x] `[agent]` `@RestControllerAdvice` único → `ProblemDetail`, com 400 carregando a lista de campos inválidos
- [x] `[agent]` `@CpfOuCnpj`: validator com dígito verificador real, ciente de `tipoPessoa`, rejeitando sequências repetidas
- [x] `[subagent]` `DocumentoIdentificacaoConverter`: normaliza para dígitos na entrada, um ponto só
- [x] `[subagent]` `PageResponse<T>` — não vazar `Page` do Spring no contrato público
- [x] `[subagent]` springdoc + `/swagger-ui`, com exemplos nos DTOs

### Cartório
- [x] `[subagent]` DTOs (request/response), mapper, service, controller com os 5 verbos
- [x] `[subagent]` `GET /cartorios/{id}/documentos`
- [x] `[agent]` Regra de exclusão: cartório com agendamento ativo pode ser removido? Decidir e registrar

### Documento
- [x] `[subagent]` CRUD completo, `GET` paginado com `size=10` default
- [x] `[subagent]` Nome único case-insensitive → `409`

### Pedido
- [x] `[subagent]` CRUD completo
- [x] `[agent]` `numero` sequencial — sequence no banco, não `count()+1` (condição de corrida)
- [x] `[subagent]` `GET /pedidos/{id}` devolve o total de agendamentos

### Agendamento
- [x] `[agent]` Validar o par `(cartorio, documento)` contra `cartorio_documento` → `409`
- [x] `[agent]` Validar coerência `tipoPessoa` × comprimento do documento → `400`
- [x] `[subagent]` `POST /pedidos/{id}/agendamentos` forçando status `PENDENTE`, ignorando status vindo do cliente
- [x] `[subagent]` `GET /pedidos/{id}/agendamentos` com o payload achatado e `@EntityGraph`
- [x] `[subagent]` `PATCH /status` e `DELETE`

## Critério de aceite

- Swagger cobre todas as rotas de `Contrato-API.md`.
- Par inválido → `409`. CPF de 11 dígitos com `JURIDICA` → `400`. CPF com dígito verificador errado → `400`.
- `GET /documentos` sem params devolve 10 itens e metadados de paginação.
- Agendamento criado com `"status":"CONCLUIDO"` no corpo nasce `PENDENTE` mesmo assim.
- Log da listagem de agendamentos mostra **uma** query, não N+1.

## Armadilhas

- Validar o par no controller espalha regra de negócio. É no service.
- Mapper que expõe entidade JPA no JSON vaza `pedido_id` e lazy proxies. DTO sempre.
