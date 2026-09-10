# Planejamento

Texto de acompanhamento do desafio Docket.

## Como os requisitos viraram tarefas

Havia três fontes e elas se contradiziam: a diretriz interna, os dois READMEs oficiais e o layout no Adobe XD. A primeira coisa foi declarar precedência — a diretriz vence — e registrar cada conflito com a decisão tomada, em vez de escolher em silêncio.

A leitura cruzada revelou duas lacunas antes de existir qualquer código:

- O card do layout exibe "nome da pessoa ou razão social", campo que a modelagem proposta não previa.
- A tela inteira gira em torno de um **Pedido** que a modelagem não continha.

Ambas resolvidas explicitamente, com a segunda registrada como a única ampliação deliberada de escopo.

O trabalho foi quebrado em **11 fases**, cada uma terminando em algo executável e verificável, ordenadas para que nenhuma tela esperasse endpoint inexistente. Cada fase virou uma especificação com tarefas e critério de aceite.

## Ferramenta de organização

Um vault Obsidian versionado junto do código, publicado como `/docs`:

| | |
|---|---|
| `Contexto/` | domínio, arquitetura, contrato de API, layout, decisões, ambiente |
| `Specs/` | uma fase por arquivo, com critério de aceite |
| `Handoff/` | prompts de execução, versionados |
| `Registro/` | o que de fato aconteceu em cada fase, incluindo o que quebrou |

A documentação nasceu antes do código e é a mesma que subiu no repositório. Não há um documento de planejamento e outro de verdade.

**26 decisões** estão registradas com contexto, escolha e consequência — inclusive as que foram revertidas depois. Duas delas foram desfeitas no meio do caminho, e o registro conta isso.

## Método

Dois papéis, separados pela natureza da tarefa:

- **Decidir** — modelagem, contrato de API, regras que atravessam camadas, revisão contra critério de aceite.
- **Executar** — o que já tem resposta certa conhecida: DTOs, componentes a partir de especificação fechada, testes de comportamento já descrito.

Toda tarefa vinha marcada com o papel responsável, e o resultado da execução era **sempre verificado contra o critério de aceite** antes de a fase fechar. Relato de conclusão não conta como evidência.

Isso pegou coisas que passariam batido: `equals`/`hashCode` que faziam duas entidades novas serem iguais dentro de um `Set`; validação vazando expressão regular para a tela do usuário; região viva de notificação que entrava no DOM junto com a mensagem, e por isso nunca era anunciada por leitor de tela.

## Diagramas e modelo

Modelo de domínio, contrato REST completo e anatomia das 9 telas estão em `Contexto/`. O schema tem 5 tabelas, com a regra central — um agendamento só existe se aquele cartório emitir aquele documento — validada no serviço e refletida no combo da tela.

## Riscos e o que se fez com eles

| Risco | O que foi feito |
|---|---|
| Fidelidade ao layout é critério de nota | Tokens extraídos do arquivo XD, não estimados; revisão tela a tela no fechamento |
| Combo condicional é a regra mais fácil de errar | Validada nos dois lados; o teste que importa é trocar de cartório **depois** de escolher um documento |
| Regressão silenciosa de N+1 | Teste que conta consultas, verificado por mutação: sem o `@EntityGraph`, ele falha |
| `docker compose up` falhar na máquina do avaliador | Testado a partir de clone limpo, com volume novo |
| CNPJ alfanumérico (IN RFB 2.229/2024) | Desmascaração num ponto só, preservando letras; `CHECK` de formato por tipo de pessoa |

## O que eu faria diferente

Passei nove fases sem um único commit. Quando uma decisão de nomenclatura precisou ser revertida, o que seria um comando virou re-tradução completa do projeto, em quatro execuções. O histórico entrou tarde — e essa é a correção mais barata da lista.
