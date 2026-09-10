---
fase: 4
estado: fechada
depende: [F2]
---

# F4 · Base do front

**Objetivo** — Fundação visual e de dados. Nenhuma tela de negócio ainda.

**Contexto necessário** — `Contexto/Layout.md`, `Contexto/Contrato-API.md`

## Tarefas

- [x] `[agent]` Abrir o XD e confirmar que o link responde. **Só se estiver fora do ar**, exportar as 9 telas para `docs/Layout/` e trabalhar pelo fallback
- [x] `[agent]` Extrair tokens no modo de especificação do XD: paleta, tipografia, raios, sombras, grid, breakpoints. Escrever em `Contexto/Layout.md` § Tokens
- [x] `[subagent]` Traduzir tokens para `tailwind.config.ts` + CSS vars. Nada de hex solto em componente
- [x] `[subagent]` Fonte via `next/font`, sem FOUT
- [x] `[subagent]` Tipos TS espelhando os DTOs do backend em `types/api.ts`
- [x] `[agent]` Cliente HTTP: base URL por env, parsing de `ProblemDetail` para erro tipado, timeout
- [x] `[agent]` `AppProvider` (Context API) — decidir a fronteira do estado: o que é servidor, o que é UI. Context guarda pouco
- [x] `[subagent]` Primitivos: `Button`, `Input`, `Select`, `Card`, `Spinner`, `EmptyState`
- [x] `[subagent]` `Toast` + provider — verde/vermelho, topo, com botão fechar, fiel ao XD
- [x] `[subagent]` `ConfirmDialog` conforme tela 8, com foco preso e `Esc` fechando
- [x] `[subagent]` Header com listras diagonais e logo
- [x] `[subagent]` Hooks de máscara: `useCpfCnpjMask` (troca por tipo de pessoa; **CNPJ aceita letra**, ver D17), `useCepMask`

## Critério de aceite

- Tokens registrados em `Contexto/Layout.md`, extraídos do modo de especificação do XD.
- Página de sandbox renderiza todos os primitivos nos dois estados (normal/erro) e bate com o XD lado a lado.
- Toast e modal funcionam isolados, com teclado.
- Erro `400` do backend chega ao front como objeto tipado com os campos, não string.

## Armadilhas

- Máscara que reformata a cada tecla quebra o cursor no meio do campo. Testar editando o meio de um CPF já preenchido.
- Context com o cache de servidor inteiro re-renderiza a árvore toda. Estado de servidor fica fora.
