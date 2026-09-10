# F0 · subagent

Projeto: `~/Documents/dev/docket`. Já existem `.gitignore`, `.env.example`, `docker-compose.yml`, `backend/Dockerfile`, `backend/.dockerignore`, `scripts/sync-docs.sh`.

Nada de lógica de negócio nesta fase. Só esqueleto que sobe.

---

## 1 · `backend/pom.xml`

Spring Boot **3.5.x** como parent, `com.docket` / `docket`, Java **21**.

Dependências:
`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `spring-boot-starter-thymeleaf`, `spring-boot-starter-actuator`, `flyway-core`, `flyway-database-postgresql`, `postgresql` (runtime), `springdoc-openapi-starter-webmvc-ui` (2.7.x), `spring-boot-starter-test` (test).

No `maven-compiler-plugin`, **`<release>21</release>` explícito** — sem isso um JDK mais novo no PATH aceita código que o container recusa.

## 2 · `backend/src/main/java/com/docket/DocketApplication.java`

`@SpringBootApplication`, `main` padrão. Nada mais.

## 3 · `backend/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: docket
  jpa:
    hibernate:
      ddl-auto: validate      # nunca update — mascara divergência com as migrations
    open-in-view: false
    properties:
      hibernate.format_sql: true
  flyway:
    enabled: true
    baseline-on-migrate: true

springdoc:
  swagger-ui:
    path: /swagger-ui

management:
  endpoints.web.exposure.include: health,info
  endpoint.health.probes.enabled: true

---
spring:
  config.activate.on-profile: local
  datasource:
    url: jdbc:postgresql://localhost:5432/docket
    username: docket
    password: docket

---
spring:
  config.activate.on-profile: docker
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
```

Senha só aparece no perfil `local`, que é descartável. O perfil `docker` lê tudo de env.

## 4 · Frontend — scaffolding

Rodar na raiz do projeto (`frontend/` **ainda não existe**, tem que ser criado pelo comando):

```bash
npx create-next-app@latest frontend \
  --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

## 5 · `frontend/next.config.ts`

Substituir o gerado por:

```ts
import type { NextConfig } from "next";

const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // O navegador sempre chama caminho relativo; o Next reescreve do lado do
    // servidor. Sem CORS, e sem a armadilha de localhost:8080 (navegador) vs
    // backend:8080 (container) — ver docs Decisoes D9.
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/actuator/:path*", destination: `${backend}/actuator/:path*` },
    ];
  },
};

export default nextConfig;
```

## 6 · `frontend/.dockerignore`

```
node_modules
.next
.git
Dockerfile
.dockerignore
npm-debug.log
```

## 7 · `frontend/Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static

USER app
EXPOSE 3000
CMD ["node", "server.js"]
```

## 8 · `frontend/app/page.tsx` — fumaça

Server component que faz `fetch` em `${process.env.BACKEND_INTERNAL_URL}/actuator/health` com `cache: "no-store"`, e mostra:

- título "Docket"
- o status do backend (`UP` em verde, qualquer outra coisa em vermelho)
- mensagem clara se o fetch falhar, **sem quebrar a página** — o healthcheck do container depende dela responder 200

Nada de estilo elaborado. É prova de conectividade, não tela.

---

## Verificação

```bash
cd ~/Documents/dev/docket
docker compose down -v
docker compose up --build
```

- [ ] `docker compose ps` → os três `healthy`
- [ ] `curl -s localhost:8080/actuator/health` → `{"status":"UP"...}`
- [ ] `localhost:3000` mostra `UP` em verde
- [ ] `curl -s localhost:3000/actuator/health` → mesmo JSON (prova o rewrite)
- [ ] `localhost:8080/swagger-ui` abre
- [ ] `grep -rn "docket" --include=*.yml --include=*.ts .` não acha senha fora de `application.yml` perfil `local`

Se o build do backend reconstruir dependências a cada mudança de código, a ordem de `COPY` no `backend/Dockerfile` foi quebrada — as deps têm que ser resolvidas antes de `COPY src`.
