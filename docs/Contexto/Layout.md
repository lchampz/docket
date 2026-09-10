# Layout

Fonte: https://xd.adobe.com/view/de1c9231-1542-41b5-ad00-355ebf402162-8b4f/grid — **abre sem login**. Navegação pelas setas no rodapé; "Modo de especificação" dá medidas e cores.

**O link é a referência de trabalho.** Consultar direto, inclusive no modo de especificação, que dá medidas e cores exatas — PNG achata isso.

Fallback: se o link cair (depende da conta que compartilhou), exportar as 9 telas para `docs/Layout/` e seguir por ali. Só nesse caso.

## As 9 telas

| # | Nome | O que prova |
|---|---|---|
| 1 | Pedido - Empty space | Estado zero: form à esquerda, empty state "Nenhum documento criado" à direita |
| 2 | Pedido - Feedback erro | Campos obrigatórios em vermelho + toast de erro |
| 3 | Pedido - Documentos solicitados | Toast verde de sucesso, lista começando a popular |
| 4 | Pedido - Documentos solicitados – 3 | Título "1 documento solicitado" + card completo com ícone de lixeira |
| 5 | Pedido - Empty space (variante) | *não inspecionada em detalhe* |
| 6 | Pedido - Documentos solicitados – 2 | "2 documentos" — contagem no plural, segundo card |
| 7 | Excluir – 1 | Estado imediatamente anterior à exclusão |
| 8 | Excluir - Feedback – 1 | Modal "Confirmar exclusão" · Cancelar / Excluir (vermelho) |
| 9 | Pedido - Empty space 2 | *não inspecionada em detalhe* |

## Anatomia da tela

**Header** — barra escura com listras diagonais roxas, logo Docket à esquerda.

**Cabeçalho do pedido** — `Pedido #1`, card branco com `Lead: <título>`, `Observação:` (parágrafo longo), badge de status à direita, rodapé com `Criado por:` e `Data de criação:`.

**Coluna esquerda** — card "Adicionar documentos ao pedido": `Nome do documento *`, `Tipo de pessoa *` (select), `CPF *` (label troca para CNPJ conforme o tipo).

**Coluna direita** — título com contagem (`N documento(s) solicitado(s)`), cards por agendamento em grid de duas colunas de dados, ícone de lixeira no canto. Empty state centralizado com ícone quando vazio.

**Toast** — topo, faixa colorida com ícone e botão de fechar. Verde sucesso, vermelho erro.

**Modal** — pequeno, centralizado, overlay cinza. Título, uma linha de texto, Cancelar (outline) e Excluir (sólido vermelho).

## Tokens

Extraídos do modo de especificação do XD em 2026-09-09. **Valores exatos, não estimados** — o painel exporta o CSS do próprio arquivo.

### Cores

| Token | Hex | Onde aparece |
|---|---|---|
| `black-100` | `#2E2D2C` | Texto principal |
| `black80` | `#585756` | Texto secundário |
| `black60` | `#828180` | Rótulo, texto de apoio |
| `grey-40` | `#ABABAB` | Placeholder |
| `black20-disable` | `#D5D5D5` | Desabilitado |
| `black10` | `#EAEAE9` | Borda, divisor |
| `cold-grey` | `#EBF0F5` | Fundo da página |
| `cold-grey-40` | `#C4C8CC` | Borda fria |
| `white` | `#FFFFFF` | Cartão |
| `green-dark` | `#008768` | Sucesso, badge "Em andamento" |
| `green-light` | `#DBFAF3` | Fundo do toast de sucesso |
| `red` | `#E65562` | Erro, botão excluir |
| `red-medium` | `#F27480` | Erro suave |
| `blue` | `#3570B2` | Link, ação secundária |
| `yellow` | `#FFAF3E` | Alerta |
| `707070` | `#707070` | Cinza avulso do arquivo |

### Tipografia — **Open Sans**

Pesos: `400` regular · `600` semibold · `700` bold.

| Estilo | Tamanho / entrelinha | Peso | Cor |
|---|---|---|---|
| `h1-jumbo` | 48 / 60 | 600 | white |
| `h2-mega` | 34 / 48 | 400 | white |
| `h3-main-title` | 24 / 36 | 700 | white |
| `h4-title` | 20 / 32 | 600 | black-100 *(há variante white)* |
| `subtitle` | 16 / 24 | 600 | black-100 |
| `body` | 14 / 20 | 400 | black-100 |
| `body-bold` | 14 / 20 | 700 | black-100 |
| `small` | 12 / 16 | 400 | black-100 |

> O XD exporta `--unnamed-font-weight-600: 600px`. O `px` é bug do exportador; o peso é `600`.

Escala completa de tamanho: 12 · 14 · 16 · 20 · 24 · 34 · 48.
Entrelinhas: 16 · 20 · 24 · 32 · 36 · 48 · 60. Sempre pareadas com o tamanho acima.

### Roxo do header e do rodapé — **aproximado**

A paleta exportada **não tem roxo**. O header é um bitmap de **1366 × 56** (medido no modo de especificação), então as listras diagonais são arte, não preenchimento com token.

Valores em uso, aproximados da arte: `--purple: #514689` · `--purple-light: #6F63A8` · `--purple-dark: #3F3468`.

> Se a fidelidade do header virar problema na F8, o caminho exato é exportar o PNG do header no XD e usar como imagem de fundo. É o único ponto do design system que não veio do arquivo.

### Anatomia confirmada na tela 4

**Header** — barra escura com listras diagonais roxas, logo Docket à esquerda.
**Rodapé** — barra roxa cheia, centralizado, "DOCKET © 2021".
**Cabeçalho do pedido** — `Pedido #1` (h4), cartão branco: `Lead: <título>` em body-bold, `Observação:` em body, badge `Em andamento` à direita com ponto verde, rodapé com `Criado por:` e `Data de criação:` em small.
**Coluna esquerda** — cartão "Adicionar documentos ao pedido", campos com placeholder `Digite aqui`, asterisco vermelho no obrigatório, botão `Criar documento` no fim.
**Coluna direita** — título `N documento(s) solicitado(s)`, cartão por agendamento com ícone de lixeira no canto, dados em duas colunas (`Pessoa física` / `Dados do cartório`), rodapé `Data de criação:`.
