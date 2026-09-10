---
fase: 5
estado: fechada
depende: [F4]
---

# F5 · Cadastros no front

**Objetivo** — CRUD de cartório e documento no React, com tudo que a diretriz exige de formulário.

**Contexto necessário** — `Contexto/Contrato-API.md`, `Contexto/Layout.md` § Tokens

## Tarefas

### Documento
- [x] `[subagent]` Listagem paginada (10 por página), com contagem no título
- [x] `[subagent]` Form de criar/editar com react-hook-form + zod
- [x] `[subagent]` Exclusão com `ConfirmDialog` + toast
- [x] `[subagent]` Empty state quando não há documento
- [x] `[subagent]` Loading durante requisição, sem layout shift

### Cartório
- [x] `[subagent]` Listagem com endereço e **contagem de documentos emitidos** (requisito da diretriz)
- [x] `[agent]` Form com ViaCEP: dispara ao completar 8 dígitos, preenche rua/bairro/cidade/UF, **campos continuam editáveis**, trata CEP inexistente (`{"erro": true}`) e API fora do ar sem travar o formulário
- [x] `[subagent]` Multi-select dos documentos que o cartório emite
- [x] `[subagent]` Máscara de CEP, validação de UF
- [x] `[subagent]` Exclusão com confirmação + toast

### Transversal
- [x] `[agent]` Erro `409` do backend vira mensagem no campo certo, não toast genérico
- [x] `[subagent]` Responsividade das duas telas nos breakpoints definidos
- [x] `[agent]` Revisar semântica: `<form>`, `<label for>`, `<table>` quando é tabela, `aria-live` no toast

## Critério de aceite

- Criar/editar/excluir os dois recursos ponta a ponta com feedback visível.
- CEP `01310100` preenche o endereço; CEP `00000000` avisa e deixa preencher à mão; ViaCEP offline não impede salvar.
- 11 documentos → paginação aparece. Zero → empty state.
- Nome de documento repetido mostra o erro sob o campo.
- Navegação por teclado completa nos dois forms.

## Armadilhas

- ViaCEP não tem CORS restritivo, mas é HTTP público e cai. Timeout curto e degradação silenciosa.
- ViaCEP devolve `200` com `{"erro": true}` para CEP inexistente. Checar o corpo, não o status.
