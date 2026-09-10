# F6 · subagent — Tela do Pedido

Projeto: `~/Documents/dev/docket/frontend`. **Next.js 16** — `params`/`searchParams` são Promises.

Esta é a tela que o avaliador abre primeiro. **Fidelidade ao layout é critério de nota.**

## Já pronto, use e não reescreva

| Arquivo | O que é |
|---|---|
| `contexts/PedidoContext.tsx` | `PedidoProvider` + `usePedido()` — `pedido`, `agendamentos`, `total`, `pagina`, `totalPaginas`, `carregandoLista`, `irParaPagina`, `excluirAgendamento` |
| `components/pedido/FormAgendamento.tsx` | **Formulário completo, com combo condicional, máscaras e mapeamento de erro. Não mexer.** |
| `components/pedido/CampoDocumento.tsx` | Campo de CPF/CNPJ |
| `components/ui/*` | `Card`, `Button`, `EmptyState`, `ConfirmDialog`, `Pagination`, `Spinner` |
| `contexts/ToastContext` | `useToast()` |

Sua parte é **apresentação**: cabeçalho do pedido, cartão de agendamento, título com contagem, estado vazio, exclusão, layout e responsividade.

---

## 1 · `app/page.tsx` — substituir a página de fumaça da F0

Hoje ela faz `fetch` direto em `/actuator/health`. Apagar isso.

A rota `/` passa a ser a tela do pedido. Buscar o primeiro pedido (`GET /pedidos?size=1`) no server component, e renderizar o cliente dentro de `<PedidoProvider pedidoId={id}>` e `<ToastProvider>`.

## 2 · Cabeçalho — `components/pedido/CabecalhoPedido.tsx`

Fiel ao XD:

```
Pedido #1                                        ← h4-title, FORA do cartão
┌──────────────────────────────────────────────┐
│ Lead: Documento para criar contrato   [badge]│  ← body-bold  ·  badge à direita
│ Observação: <texto longo>                    │  ← body
│ ────────────────────────────────────────────  │
│ Criado por: João da Silva   Data de criação: …│  ← small
└──────────────────────────────────────────────┘
```

- `Pedido #{numero}`, não o `id`
- Badge de status: ponto + texto. `EM_ANDAMENTO` usa `green-dark` sobre `green-light`; demais em tom neutro
- Datas em português: `11 de maio de 2021` (`Intl.DateTimeFormat("pt-BR", { dateStyle: "long" })`)

## 3 · Layout de duas colunas

Esquerda: `<FormAgendamento />`. Direita: título + lista.
`grid` de 2 colunas a partir de `lg`, **uma coluna abaixo disso**, formulário primeiro.

## 4 · Título com contagem

`1 documento solicitado` / `2 documentos solicitados` — **plural correto**, vindo de `total` do contexto (que é o do servidor, não o tamanho do array da página).

## 5 · Cartão de agendamento — `components/pedido/CartaoAgendamento.tsx`

```
┌──────────────────────────────────────────────┐
│ Certidão de nascimento                    🗑  │  ← subtitle · lixeira à direita
│                                              │
│ Pessoa física          Dados do cartório     │  ← body-bold, duas colunas
│ Nome: …                CEP: 58686-989        │
│ CPF: 125.134.156-45    Rua: …      Nº: 10    │
│                        Cidade: …   UF: SP    │
│ ────────────────────────────────────────────  │
│ Data de criação: 11 de maio de 2021          │  ← small
└──────────────────────────────────────────────┘
```

- Cabeçalho da coluna esquerda é `Pessoa física` ou `Pessoa jurídica`, conforme `tipoPessoa`
- Rótulo `Nome:` para PF, `Razão social:` para PJ; `CPF:` ou `CNPJ:`
- **Reaplicar as máscaras na exibição** — a API devolve sem máscara:
  - CPF `12513415645` → `125.134.156-45`
  - CNPJ `12ABC34501DE35` → `12.ABC.345/01DE-35`
  - CEP `58686989` → `58686-989`
- Botão de lixeira com `aria-label="Excluir <nome do documento>"`
- Duas colunas de dados a partir de `sm`, uma abaixo disso

## 6 · Exclusão

Lixeira abre `ConfirmDialog` (tela 8 do XD): título `Confirmar exclusão`, texto `Tem certeza que deseja excluir este documento?`, `Cancelar` / `Excluir`.
Confirmar → `excluirAgendamento(id)` → toast verde `Documento excluído com sucesso` → contagem cai.
Erro → toast vermelho.

## 7 · Estado vazio e carregando

- Zero agendamentos → `EmptyState` com **"Nenhum documento criado"** (texto do XD, não inventar outro)
- `carregandoLista` → `Spinner`, **sem encolher a coluna** (reservar altura mínima)

## 8 · Paginação

`Pagination` já existe. Só aparece com `totalPaginas > 1`; usa `irParaPagina`.

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose up -d --build
```

- [ ] `/` mostra `Pedido #1`, lead, observação, badge, criado por e data em português
- [ ] Sem agendamentos → **"Nenhum documento criado"**
- [ ] Escolher **Tabelionato de Notas (Porto Alegre)** → o combo de documento mostra **só** Escritura Pública e Procuração, **nenhuma certidão**
- [ ] Trocar para **1º Ofício (São Paulo)** → o combo passa a mostrar os 6 e a seleção anterior **é limpa**
- [ ] Bloco "Dados do cartório" preenche ao escolher e troca ao trocar
- [ ] Criar com CPF `111.444.777-35` → toast verde, cartão aparece, título vira `1 documento solicitado`
- [ ] Criar um segundo → `2 documentos solicitados`
- [ ] Cartão mostra CPF **mascarado** e o endereço do cartório
- [ ] Criar com pessoa jurídica e CNPJ `12.abc.345/01de-35` → cartão mostra `12.ABC.345/01DE-35` e `Razão social:`
- [ ] Lixeira → modal → confirmar → cartão some, contagem cai, toast verde
- [ ] 375px: uma coluna, formulário em cima, `scrollWidth === clientWidth`
- [ ] `grep -rn "fetch(" app components --include=*.tsx` → **vazio**

**Apague os agendamentos criados nos testes.**
