# F5 · subagent — Cadastros no front

Projeto: `~/Documents/dev/docket/frontend`. **Next.js 16** — `params`/`searchParams` são Promises (`await props.params`). Ler `frontend/AGENTS.md` na dúvida.

Já instalados: `react-hook-form`, `zod`, `@hookform/resolvers`.

## Já pronto, use e não reescreva

| Arquivo | O que é |
|---|---|
| `lib/api/client.ts` | `get/post/put/del`, `ApiError` com `codigo`, `erros[]`, `doCampo()` |
| `lib/api/types.ts` | DTOs do backend |
| `lib/api/formErros.ts` | `aplicarErroNoFormulario(erro, setError, mapa)` — devolve a mensagem que sobrou para o toast, ou `null` |
| `lib/viacep.ts` | `buscarCep()` → `ok` / `nao-encontrado` / `indisponivel` |
| `hooks/useBuscaCep.ts` | `useBuscaCep(aoEncontrar)` → `{ consultar, buscando, mensagem }` |
| `hooks/useCepMask`, `useCpfCnpjMask` | Máscaras |
| `components/ui/*` | `Button`, `Input`, `Select`, `Card`, `Spinner`, `EmptyState`, `Toaster`, `ConfirmDialog` |
| `contexts/ToastContext` | `useToast()` → `sucesso` / `erro` |

**Nenhum `fetch` fora de `lib/api`. Nenhum `window.confirm`.**

---

## 1 · `/documentos`

- Listagem paginada, **`size=10`**, com contagem no título: `Documentos (N)`
- `EmptyState` "Nenhum documento criado" quando não há nenhum
- `Spinner` durante a requisição, **sem pular layout** (reservar a altura)
- Botão "Novo documento" abre formulário (rota ou painel — sua escolha, mantenha simples)
- Form com `react-hook-form` + `zod`: `nome` obrigatório, no máximo 150
- Excluir com `ConfirmDialog` → `del()` → toast de sucesso → lista recarrega
- Paginação só aparece com `totalPages > 1`

**Erro `409 NOME_DUPLICADO` vai para o campo `nome`**, não para toast:

```ts
const sobrou = aplicarErroNoFormulario(erro, setError, { NOME_DUPLICADO: "nome" });
if (sobrou) toast.erro(sobrou);
```

`RECURSO_EM_USO` ao excluir não tem campo — vai para toast de erro.

## 2 · `/cartorios`

### Listagem
- Nome · Endereço (rua, número, cidade/UF) · CEP mascarado · **contagem de documentos emitidos** (usar `totalDocumentos`, requisito da diretriz) · ações
- `EmptyState`, `Spinner`, paginação e exclusão como em documentos

### Formulário (criar e editar)
Campos: `nome`, `cep`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `documentoIds`.

**ViaCEP** — ligar `useBuscaCep` ao campo de CEP:

```ts
const { consultar, buscando, mensagem } = useBuscaCep((endereco) => {
  setValue("rua", endereco.rua);
  setValue("bairro", endereco.bairro);
  setValue("cidade", endereco.cidade);
  setValue("uf", endereco.uf);
});
```

Chamar `consultar(valor)` a cada mudança do CEP — o hook já ignora valor incompleto e repetição.

- Enquanto busca: indicador discreto no campo de CEP
- `mensagem` aparece como aviso abaixo do CEP, **não bloqueia nada**
- **Os campos de endereço continuam editáveis sempre**, mesmo depois do autopreenchimento
- `uf` é `select` com as 27 unidades
- `documentoIds` é multi-select de checkboxes, **ao menos um obrigatório** (o backend devolve `Selecione ao menos um documento emitido`)

Máscara de CEP na exibição; enviar **só dígitos** para a API.

## 3 · Navegação

Header ganha links para `Pedido`, `Cartórios` e `Documentos`, com o item ativo destacado (`aria-current="page"`).

## 4 · Responsividade e semântica

- Listagens: tabela no desktop, cartões abaixo de 768px, **sem rolagem horizontal**
- `<form>` de verdade, `<label for>` em todo campo, `aria-invalid` + `aria-describedby` no erro
- Foco visível em tudo que é interativo
- Botão de submit com estado de carregando e desabilitado durante o envio

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose up -d --build
```

- [ ] `/documentos` lista os 6 do seed, título mostra `(6)`
- [ ] Criar documento → toast verde, aparece na lista, contagem sobe
- [ ] Criar `"certidão de nascimento"` → **erro sob o campo `nome`**, sem toast
- [ ] Criar 6 documentos a mais (total 12) → **paginação aparece**, 10 na primeira página
- [ ] Excluir documento sem agendamento → some, toast verde
- [ ] `/cartorios` lista os 4 com contagem 6 / 3 / 3 / 2
- [ ] CEP `01310100` preenche Rua, Bairro, Cidade e UF sozinho
- [ ] Depois de preencher, **ainda dá para editar Rua à mão**
- [ ] CEP `00000000` → aviso "CEP não encontrado", formulário continua utilizável
- [ ] Salvar cartório sem marcar documento → erro no grupo de documentos
- [ ] 375px: listagens viram cartões, `document.documentElement.scrollWidth === clientWidth`
- [ ] `grep -rn "fetch(" app components --include=*.tsx` → **vazio**

**Apague o que criar durante os testes** para o seed voltar a 4 cartórios / 6 documentos.
