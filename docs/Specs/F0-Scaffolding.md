---
fase: 0
estado: fechada
depende: []
---

# F0 · Scaffolding

**Objetivo** — `docker compose up` num clone limpo sobe os três serviços saudáveis. Nada de negócio ainda.

**Contexto necessário** — `Contexto/Arquitetura.md`, `Contexto/Ambiente.md`

## Tarefas

Handoff: `Handoff/F0-subagent.md` — disparado via `cursor-agent`, não colado à mão.

- [x] `[agent]` `git init` (branch `main`), `.gitignore` (Java + Node + `.env` + IDE), estrutura de pastas
- [x] `[agent]` Vault → `docs/`: decidido **cópia no fechamento** (D8), `scripts/sync-docs.sh` criado, execução na F8
- [x] `[agent]` `backend/Dockerfile` multi-stage — deps resolvidas antes de `COPY src`, usuário não-root, `MaxRAMPercentage`
- [x] `[agent]` `backend/.dockerignore` e `.env.example`
- [x] `[agent]` `docker-compose.yml` — `pg_isready -U -d` no healthcheck, `depends_on: service_healthy` encadeado, volume nomeado
- [x] `[agent]` **D9**: front fala com o backend por rewrite do Next, não por CORS
- [x] `[agent]` `README.md` provisório e `scripts/sync-docs.sh`
- [x] `[agent]` `docker compose config` validado
- [x] `[subagent]` `backend/pom.xml` — Boot 3.5, `<release>21</release>`, deps web/jpa/validation/thymeleaf/actuator/flyway/postgres/springdoc
- [x] `[subagent]` `DocketApplication.java` + `application.yml` com perfis `local` e `docker`
- [x] `[subagent]` `create-next-app` em `frontend/` — TS, Tailwind, App Router, sem `src/`, alias `@/`
- [x] `[subagent]` `frontend/next.config.ts` — `output: standalone` + rewrites de `/api` e `/actuator`
- [x] `[subagent]` `frontend/Dockerfile` e `frontend/.dockerignore`
- [x] `[subagent]` `app/page.tsx` de fumaça, consumindo o health do backend
- [x] `[agent]` Verificação final: `down -v` + `up --build`, os três `healthy`, rewrite provado

> `frontend/Dockerfile` saiu como tarefa `[subagent]` por ordem de execução: `create-next-app` recusa
> diretório não vazio, então o Dockerfile só pode ser escrito depois do scaffolding. O conteúdo
> já está pronto no handoff — resta colar.

> Licença ficou de fora: não é requisito do desafio e o repositório é de candidatura.

## Critério de aceite

```bash
docker compose down -v && docker compose up --build
```

- Os três containers ficam `healthy`.
- `curl localhost:8080/actuator/health` → `UP`.
- `localhost:3000` renderiza e mostra o resultado do health do backend.
- Nenhum segredo hardcoded — tudo via env.

## Armadilhas

- Postgres `healthy` não significa aceitando conexão. Usar `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB`, não um `sleep`.
- Copiar `pom.xml` e rodar `dependency:go-offline` **antes** de copiar `src/`, senão toda mudança de código rebaixa o cache.
