# Harness

Como este projeto é executado. Ler antes de abrir qualquer spec.

## Dois papéis

| | **agent** | **subagent** |
|---|---|---|
| Perfil de modelo | Caro, raciocínio longo, contexto amplo | Rápido e barato, especializado em código |
| Serve para | **Decidir** | **Digitar** |
| Output | Uma decisão, que por acaso vira código | Código que executa uma decisão já tomada |
| Enxerga | O projeto inteiro e o histórico | Só a tarefa que recebeu |
| Erra em | Excesso de escopo | Falta de contexto |
| Custo de um erro | Alto — decisão errada contamina fases | Baixo — código errado é rejeitado no aceite |

Isto são **papéis, não ferramentas**. Hoje `agent` é a sessão Claude Code e `subagent` é o `cursor-agent`; trocar a implementação não muda a spec.

### Quem faz o quê

| Tarefa | agent | subagent |
|---|---|---|
| Modelagem, contrato de API, regra de negócio | ✅ | |
| Trade-off entre duas soluções defensáveis | ✅ | |
| Debug de comportamento inesperado | ✅ | |
| Revisão contra critério de aceite | ✅ | |
| Escrever a spec e o prompt do subagent | ✅ | |
| Boilerplate: DTO, mapper, migration de esquema já decidido | | ✅ |
| Componente a partir de spec visual fechada | | ✅ |
| Renomear, extrair, mover, aplicar padrão já estabelecido | | ✅ |
| Teste de comportamento já especificado | | ✅ |

Regra de bolso: **resposta certa conhecida → subagent. Trade-off → agent.**

Nas specs cada tarefa vem marcada `[agent]` ou `[subagent]`.

**Tarefa `[subagent]` que não possa ser executada sem perguntar algo está mal escrita.** O prompt é o contrato: se falta informação, o defeito é da spec, e volta para o agent. Não se resolve pedindo para o subagent "usar o bom senso" — bom senso é justamente o que ele não foi contratado para ter.

## Como o agent dispara o subagent

O agent invoca direto do terminal e lê o resultado na mesma sessão — sem copiar e colar, sem trocar de janela.

```bash
cd ~/Documents/dev/docket
cursor-agent -p --force --model composer-2.5 "$(cat <caminho do handoff>)"
```

| Flag | Por quê |
|---|---|
| `-p` | Não-interativo, com acesso a escrita e shell. Sem isso abre TUI e trava a sessão |
| `--force` | Não pede aprovação por comando. O escopo já foi aprovado quando a spec foi aceita |
| `--model` | Fixa o perfil. `auto` esconde qual modelo rodou e torna o resultado irreprodutível |
| `--output-format` | `text` para ler, `stream-json` quando o log importa |

**Modelos do papel subagent**, em ordem de escalada:

1. `composer-2.5` — padrão. Rápido e barato, é o perfil que o papel descreve.
2. `gpt-5.3-codex` — quando o padrão erra duas vezes na mesma tarefa.
3. Terceira falha **não é** motivo para escalar de novo. É sintoma de spec ruim: volta para o agent reescrever.

Prompts ficam em `Handoff/F<n>-subagent.md`, versionados. Se um handoff precisou ser reescrito no meio, o motivo vai para o `Registro/`.

## Protocolo de sessão

1. Abrir a spec da fase. Ler **Contexto necessário** e carregar só o que ele lista.
2. Executar as tarefas `[agent]` que não dependem do subagent.
3. Escrever o handoff, disparar o `cursor-agent`, ler o resultado.
4. **Verificar contra o critério de aceite** — o agent não confia no relato do subagent, roda a verificação.
5. Marcar `- [x]` só depois disso. Checkbox marcado sem evidência é mentira.
6. Fechar a fase em `Registro/F<n>.md`: o que foi feito, o que mudou de rumo, o que quebrou.
7. Decisão que sobrevive à fase vai para `Contexto/Decisoes.md`. O resto morre no registro.

## Onde a informação mora

| Camada | O quê | Versionado |
|---|---|---|
| Vault (`/docs`) | Tudo que o projeto precisa saber sobre si mesmo | ✅ |
| Memória do agent | Ponteiros curtos para o vault + restrições que não pertencem ao repo | ❌ |
| Código | A verdade executável | ✅ |

A memória do agent **não** duplica o vault. Guarda o mínimo para uma sessão fria saber onde procurar.

## Economia de contexto

O que faz o custo explodir é carregar o projeto inteiro para mudar uma linha.

- **Spec autocontida.** Cada uma declara o que precisa; nada de "leia o resto para entender".
- **`Contexto/` estável.** Domínio e contrato de API em arquivos curtos, que cabem em qualquer sessão.
- **Registro em vez de re-leitura.** Para saber o que a F2 fez, ler `Registro/F2.md`, não o diff.
- **Handoff como fronteira.** O subagent recebe um prompt fechado; o contexto do agent não vaza para ele, e o custo dele não entra no do agent.
- **Fase fechada não reabre.** Se reabriu, virou spec nova.
