---
fase: 6
estado: fechada
depende: [F5]
---

# F6 · Tela do Pedido

**Objetivo** — A tela do layout, inteira. É a peça que o avaliador vai abrir primeiro.

**Contexto necessário** — o link do XD (`Contexto/Layout.md`), `Contexto/Layout.md`, `Contexto/Contrato-API.md`, `Contexto/Dominio.md` § Regras

## Tarefas

- [x] `[subagent]` **Substituir `app/page.tsx`**, que ainda é a página de fumaça da F0 com `fetch` direto
- [x] `[subagent]` Cabeçalho do pedido vindo de `GET /pedidos/{id}` — lead, observação, badge de status, criado por, data
- [x] `[subagent]` Bloco "Dados do cartório" no formulário (CEP, Rua, Número, Cidade, UF) **somente leitura**, preenchido ao escolher o cartório. Ver D20
- [x] `[subagent]` Layout de duas colunas, form à esquerda, listagem à direita
- [x] `[agent]` **Combo condicional**: seleciona cartório → carrega `GET /cartorios/{id}/documentos` → popula documentos. Trocar de cartório limpa a seleção inválida. Estado de loading no select. É a regra mais fácil de errar do projeto
- [x] `[subagent]` `Tipo de pessoa` troca o label CPF↔CNPJ, troca a máscara e **limpa o valor digitado**
- [x] `[agent]` Máscara de CNPJ **aceita letra** (`00.AAA.000/0000-00`, com os 2 últimos numéricos) e força maiúscula. CPF continua só dígito. Ver D17
- [x] `[subagent]` Campo nome/razão social com label alternando por tipo de pessoa (`Nome Completo` ↔ `Razão social`)
- [x] `[subagent]` Validação de obrigatórios com destaque vermelho, fiel à tela 2
- [x] `[subagent]` Card de agendamento no grid de dados, com ícone de lixeira
- [x] `[subagent]` Título com contagem, plural correto: "1 documento solicitado" / "2 documentos solicitados"
- [x] `[subagent]` Empty state "Nenhum documento criado" (tela 1)
- [x] `[subagent]` Exclusão: modal (tela 8) → `DELETE` → toast → contagem atualiza
- [x] `[subagent]` Paginação acima de 10 agendamentos
- [x] `[agent]` Fluxo de erro da tela 2: `409` de par inválido e `400` de CPF inválido chegam ao campo certo
- [x] `[agent]` Estado no Context: como a contagem, a lista e o form conversam sem re-render em cascata
- [x] `[subagent]` Responsividade — as duas colunas viram uma no mobile

## Critério de aceite

- Cadastrar agendamento ponta a ponta: combo condicional → máscara certa → salva → card aparece → contagem sobe → toast verde.
- Selecionar cartório que não emite certo documento: ele **não aparece** no combo. Forçar via API → `409` exibido no campo.
- Escolher um cartório preenche o bloco de endereço; trocar de cartório troca o endereço; os campos não aceitam digitação.
- Trocar tipo de pessoa com CPF preenchido limpa o campo e troca a máscara.
- Digitar `12.abc.345/01de-35` no campo de CNPJ é aceito e chega ao backend como `12ABC34501DE35`.
- Excluir: modal → confirma → card some → contagem desce → toast.
- Zero agendamentos → empty state. 11 → paginação.
- Comparação lado a lado com as telas 1, 2, 4, 6 e 8 no XD.

## Armadilhas

- Trocar de cartório mantendo documento selecionado é o bug clássico deste desafio. Limpar sempre.
- Contagem lida do array local diverge do backend depois de erro parcial. Fonte única.
