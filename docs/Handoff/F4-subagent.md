# F4 · subagent — Base do front

Projeto: `~/Documents/dev/docket/frontend`. **Next.js 16.3.4**, App Router, TS, Tailwind.

## ⚠️ Next 16 quebra padrões de 14/15

Antes de escrever código de Next, ler `frontend/AGENTS.md` e, na dúvida, `node_modules/next/dist/docs/`.

- **`params` e `searchParams` são Promises.** Acesso síncrono foi *removido*: `const { id } = await props.params`. Tipar com `PageProps<'/rota'>` (rodar `npx next typegen`)
- `cookies()`, `headers()`, `draftMode()` também são assíncronos
- Turbopack é o bundler padrão · React 19.2

## Já pronto, use e não reescreva

| Arquivo | O que é |
|---|---|
| `lib/api/client.ts` | `get/post/put/patch/del`, `ApiError` com `codigo`, `erros[]` e `doCampo(campo)` |
| `lib/api/types.ts` | DTOs do backend, conferidos contra `/v3/api-docs` |
| `contexts/ToastContext.tsx` | `ToastProvider`, `useToast()` (`sucesso`/`erro`/`fechar`), `useToasts()` |
| `contexts/PedidoContext.tsx` | `PedidoProvider`, `usePedido()` — pedido, agendamentos, cartórios, combo condicional |

**Não criar outro cliente HTTP nem outro contexto.**

---

## 1 · Tokens no Tailwind — `app/globals.css`

Extraídos do XD. **Valores exatos, não aproximar.**

```
--black-100: #2E2D2C   --black80: #585756   --black60: #828180
--grey-40:   #ABABAB   --black20:  #D5D5D5   --black10: #EAEAE9
--cold-grey: #EBF0F5   --cold-grey-40: #C4C8CC   --white: #FFFFFF
--green-dark:#008768   --green-light: #DBFAF3
--red:       #E65562   --red-medium:  #F27480
--blue:      #3570B2   --yellow:      #FFAF3E
```

Fundo da página é `--cold-grey`. Cartão é `--white`. Texto é `--black-100`.

**Tipografia — Open Sans** via `next/font/google`, pesos 400/600/700.

| Estilo | px / entrelinha | Peso |
|---|---|---|
| `h1-jumbo` | 48 / 60 | 600 |
| `h2-mega` | 34 / 48 | 400 |
| `h3-main` | 24 / 36 | 700 |
| `h4-title` | 20 / 32 | 600 |
| `subtitle` | 16 / 24 | 600 |
| `body` | 14 / 20 | 400 |
| `body-bold` | 14 / 20 | 700 |
| `small` | 12 / 16 | 400 |

Registrar como utilitários do tema (Tailwind v4: `@theme`). **Nenhum hex solto em componente.**

## 2 · `next.config.ts` — ligar o React Compiler

Acrescentar `reactCompiler: true` ao config existente (estável no 16). Instalar `babel-plugin-react-compiler` se o build pedir. Se o build quebrar, **reverter e relatar** — não insistir.

## 3 · Primitivos — `components/ui/`

`Button` (variantes `primario`/`neutro`/`perigo`, estado `carregando`), `Input` (com `label`, `obrigatorio`, `erro`, `hint`), `Select`, `Card`, `Spinner`, `EmptyState` (ícone + mensagem).

Todos com `focus-visible` visível, `aria-invalid` quando há erro, e a mensagem de erro ligada por `aria-describedby`.

## 4 · `components/ui/Toaster.tsx`

Consome `useToasts()`. Faixa no topo, centralizada, `--green-light` com texto `--green-dark` no sucesso, tom vermelho no erro, ícone e botão de fechar. Container com `role="status"` e `aria-live="polite"`.

## 5 · `components/ui/ConfirmDialog.tsx`

Fiel à tela 8 do XD: overlay cinza, caixa branca centralizada, título, uma linha de texto, `Cancelar` (neutro) e `Excluir` (perigo).

Usar `<dialog>` nativo ou foco preso à mão: `Esc` fecha, foco entra na caixa e não escapa, ao fechar volta para quem abriu.

> Nada de `window.confirm`. Além de não bater com o layout, ele bloqueia automação de teste.

## 6 · `components/layout/Header.tsx` e `Footer.tsx`

Header: barra `--black-100` com listras diagonais roxas e o logo "Docket" à esquerda. Rodapé: barra roxa cheia, centralizado, `DOCKET © 2021`.

## 7 · Máscaras — `hooks/`

`useCepMask` — `00000-000`, só dígitos.

`useCpfCnpjMask(tipoPessoa)`:
- `FISICA` → `000.000.000-00`, **só dígitos**
- `JURIDICA` → `00.AAA.000/0000-00` — **os 12 primeiros aceitam letra**, os 2 últimos só dígito. Forçar maiúscula

> CNPJ é alfanumérico desde a IN RFB 2.229/2024. Máscara que só aceita dígito rejeita CNPJ válido.

Ambas expõem valor mascarado (exibição) e cru (envio). **Editar o meio de um valor já preenchido não pode jogar o cursor para o fim** — é o defeito clássico de máscara.

## 8 · Sandbox — `app/sandbox/page.tsx`

Página listando todos os primitivos nos estados normal e erro, os dois toasts, o modal e as duas máscaras. Serve para comparar com o XD lado a lado. Não é rota de produto.

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose up -d --build
```

- [ ] `npm run build` passa sem erro de tipo
- [ ] `/sandbox` renderiza todos os primitivos nos dois estados
- [ ] Toast de sucesso e de erro aparecem e somem sozinhos
- [ ] Modal: `Esc` fecha, `Tab` não escapa da caixa, foco volta ao botão de origem
- [ ] Digitar `12abc34501de35` no campo CNPJ mostra `12.ABC.345/01DE-35`
- [ ] Digitar `11144477735` no campo CPF mostra `111.444.777-35`
- [ ] Posicionar o cursor no meio de um CPF preenchido e digitar **não** joga o cursor para o fim
- [ ] `grep -rn "#[0-9A-Fa-f]\{6\}" app components hooks --include=*.tsx` → **vazio** (fora de `globals.css`)
- [ ] Nenhum `window.confirm` ou `window.alert` no código
