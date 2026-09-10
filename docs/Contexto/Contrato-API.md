# Contrato REST

```
GET    /api/v1/cartorios                    ?page&size&nome
POST   /api/v1/cartorios
GET    /api/v1/cartorios/{id}
PUT    /api/v1/cartorios/{id}
DELETE /api/v1/cartorios/{id}
GET    /api/v1/cartorios/{id}/documentos    → alimenta o combo condicional

GET    /api/v1/documentos                   ?page&size=10  (paginação obrigatória)
POST   /api/v1/documentos
PUT    /api/v1/documentos/{id}
DELETE /api/v1/documentos/{id}

GET    /api/v1/pedidos                      ?page&size&status
POST   /api/v1/pedidos
GET    /api/v1/pedidos/{id}                 → cabeçalho + total de agendamentos
PUT    /api/v1/pedidos/{id}
DELETE /api/v1/pedidos/{id}

GET    /api/v1/pedidos/{id}/agendamentos    ?page&size
POST   /api/v1/pedidos/{id}/agendamentos    → nasce PENDENTE
GET    /api/v1/agendamentos/{id}
PATCH  /api/v1/agendamentos/{id}/status
DELETE /api/v1/agendamentos/{id}
```

## Payload achatado

`GET /pedidos/{id}/agendamentos` devolve pronto o que o card renderiza — nome do documento, tipo de pessoa, nome/razão social, CPF/CNPJ, CEP e endereço completo do cartório, data de criação. Sem N+1 no front, e sem N+1 no backend (`@EntityGraph`).

## Códigos

| Situação | Status |
|---|---|
| Validação de campo | `400` + lista de campos no `ProblemDetail` |
| `tipo_pessoa` incoerente com o documento | `400` |
| Recurso inexistente | `404` |
| Par cartório/documento inválido | `409` |
| Duplicata ativa | `409` |
| Nome de documento repetido | `409` |
