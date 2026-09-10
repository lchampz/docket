---
fase: 10
estado: fechada
depende: [F9]
---

# F10 · Fechamento

**Objetivo** — O que o avaliador abre. O passo a passo do README **vai ser seguido ao pé da letra** — está escrito no enunciado.

**Contexto necessário** — `Contexto/Decisoes.md`, o link do XD

## Tarefas

- [x] `[agent]` `README.md`: o que é, stack, como subir em um comando, URLs (front, Swagger, Thymeleaf), credenciais de exemplo, como rodar testes
- [x] `[agent]` Seção "Decisões" no README, curta, cobrindo: `Pedido` fora da diretriz (D3), campos extras no agendamento (D2), Thymeleaf + React coexistindo (D5), API de certidões morta (D6)
- [x] `[agent]` `docs/Planejamento.md` — a narrativa que vai por e-mail: como os requisitos viraram tarefas, o vault, a divisão agent/subagent, os diagramas
- [x] `[subagent]` Copiar/sincronizar o vault para `docs/` conforme decidido em F0
- [x] `[agent]` **Teste do avaliador**: clone limpo em outro diretório, seguir o README literalmente, cronometrar. O que travar, corrigir no README
- [x] `[agent]` Revisão de fidelidade tela a tela contra o XD — telas 1, 2, 3, 4, 6, 8
- [x] `[agent]` Varredura de requisitos: reler `Diretriz.md` linha a linha marcando onde cada item foi cumprido
- [x] `[subagent]` Coleção de exemplos da API (`.http` ou Bruno) em `docs/`
- [x] `[agent]` Fechar `Registro/` de todas as fases e marcar o board

## Critério de aceite

- `git clone` + seguir o README = aplicação funcionando, sem passo implícito.
- Toda linha da diretriz mapeada para onde foi atendida.
- Nenhum `TODO`, `console.log` ou credencial no código.
- Board com as 9 fases ✅.

## Armadilhas

- README escrito de memória sempre pula um passo. Executar de verdade, num diretório limpo.
- `docker compose up` com cache quente esconde erro de build. `down -v` e `--no-cache` antes do teste final.
