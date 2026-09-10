# Docket — vault do projeto

Second brain do desafio Docket. **Este vault sobe para o repositório como `/docs`.**

## Ordem de leitura

Sessão nova lê nesta ordem e para quando tiver contexto suficiente:

1. `Harness.md` — os papéis **agent** e **subagent**, como um dispara o outro, e o protocolo de sessão.
2. `Contexto/` — o que é estável: domínio, arquitetura, contrato de API, layout, decisões.
3. `Specs/README.md` — o estado do board.
4. A spec da fase corrente. **Só ela.**

Não existe motivo para uma sessão carregar nove specs.

## Mapa

| Pasta | Conteúdo | Muda com que frequência |
|---|---|---|
| `Contexto/` | Domínio, arquitetura, API, layout, decisões | Raramente — mudança aqui é ADR |
| `Specs/` | Uma fase por arquivo, com checkboxes | A cada sessão |
| `Handoff/` | Prompts autocontidos para o subagent, um por fase | A cada fase |
| `Registro/` | Log do que aconteceu, por fase | A cada sessão |
| `Diretriz.md` | Fonte original do Victor | Nunca (é o enunciado) |
| `Planejamento.md` | Narrativa do planejamento — é o que vai por e-mail à Docket | No fechamento |
