# Docket

Sistema de solicitação de documentos a cartórios.
Java 21 · Spring Boot · Thymeleaf · Postgres · Next.js · TypeScript · Tailwind

> **README provisório.** A versão final, com o passo a passo testado do zero, sai na fase 8.
> O planejamento completo está em [`docs/`](docs/).

## Subir

```bash
cp .env.example .env
docker compose up --build
```

| | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API REST | http://localhost:8080/api/v1 |
| Swagger | http://localhost:8080/swagger-ui |
| Cartórios (Thymeleaf) | http://localhost:8080/cartorios |

## Derrubar

```bash
docker compose down -v
```
