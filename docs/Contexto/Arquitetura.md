# Arquitetura

```
docket/
├── docker-compose.yml    db + backend + frontend
├── .env.example
├── README.md             passo a passo de execução (é avaliado)
├── docs/                 este vault
├── backend/              Java 21 · Spring Boot 3.5 · Maven
└── frontend/             Next.js · TypeScript · Tailwind
```

## Backend — package by feature

```
com.docket.
├── cartorios/     Controller · Service · Repository · Entity · dto/ · mapper
├── documentos/
├── pedidos/
├── agendamentos/
├── web/           controllers Thymeleaf
└── shared/        exception handler, validators, config, page dto
```

Escolha deliberada: *organização* e *semântica* são critério de nota declarado. Cada pasta conta uma história de negócio; não existe `services/` com doze classes soltas.

**Idioma** — substantivo do negócio em português (`Cartorio`, `documentoIdentificacao`, `FISICA`), verbo e estrutura em inglês (`list`, `findById`, `toResponse`, `Service`, `PageResponse`). Ver D26.

- **Persistência** — Spring Data JPA + Flyway. Seed em migration repetível separada.
- **Erros** — um único `@RestControllerAdvice` devolvendo `ProblemDetail` (RFC 7807).
- **Docs** — springdoc-openapi em `/swagger-ui`.
- **Validação** — Bean Validation + `@CpfOuCnpj` com dígito verificador de verdade, não regex.

## Duas superfícies, um Service

| Superfície | Rota | Papel |
|---|---|---|
| Thymeleaf | `/cartorios` | CRUD server-rendered — cumpre literalmente o requisito obrigatório do desafio backend |
| REST | `/api/v1/**` | Consumido pelo React, documentado no Swagger |

Mesmo `Service`, controller diferente. Justificar no README como decisão, para não parecer duplicação.

## Frontend

- **Next.js (App Router) + TS + Tailwind** — casa a diretriz ("React/TS") com o enunciado oficial ("Nextjs/React + Tailwind").
- **Estado**: Context API (obrigatório pela diretriz). Sem zustand — não vale a dependência quando o Context é requisito explícito.
- **Formulários**: react-hook-form + zod, espelhando as regras do backend.
- **ViaCEP** com fallback manual quando o CEP não existe ou a API cai.

## Docker

- `postgres:16-alpine`, healthcheck, volume nomeado.
- `backend`: multi-stage `maven:3.9-eclipse-temurin-21` → `eclipse-temurin:21-jre-alpine`.
- `frontend`: multi-stage `node:22-alpine` → `output: standalone`.
- `depends_on: condition: service_healthy`.

**`docker compose up` do zero tem que subir tudo com dados de exemplo.** Requisito explícito de reprodutibilidade — e o avaliador vai seguir o README ao pé da letra.
