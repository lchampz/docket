# F8b · subagent — Tradução do frontend

Projeto: `~/Documents/dev/docket/frontend`. **Next.js 16** — `params`/`searchParams` são Promises.

**O backend já foi traduzido e o front está quebrado.** Sua tarefa é realinhá-lo.

## Convenção de nome

- **camelCase para nome composto** em pasta, arquivo utilitário, função, variável e campo
- Componente React continua **PascalCase**
- **URL continua kebab-case**, acompanhando a API

## Contrato novo do backend

```
GET/POST/PUT/DELETE  /api/v1/notary-offices[/{id}]        ?page&size&name
GET                  /api/v1/notary-offices/{id}/document-types
GET/POST/PUT/DELETE  /api/v1/document-types[/{id}]        ?page&size
GET/POST/PUT/DELETE  /api/v1/orders[/{id}]
GET/POST             /api/v1/orders/{id}/document-requests
GET/DELETE           /api/v1/document-requests/{id}
PATCH                /api/v1/document-requests/{id}/status
```

### Campos do JSON

| antes | agora |
|---|---|
| `nome` | `name` |
| `cep` / `rua` / `numero` / `bairro` / `cidade` / `uf` | `zipCode` / `street` / `number` / `district` / `city` / `state` |
| `documentos` | `documentTypes` |
| `documentoIds` | `documentTypeIds` |
| `totalDocumentos` | `totalDocumentTypes` |
| `totalAgendamentos` | `totalRequests` |
| `numero` (pedido) | `number` |
| `observacao` | `notes` |
| `criadoPor` | `createdBy` |
| `cartorioId` / `documentoId` | `notaryOfficeId` / `documentTypeId` |
| `tipoPessoa` | `personType` — valores `INDIVIDUAL` / `COMPANY` |
| `nomeRazaoSocial` | `legalName` |
| `documentoIdentificacao` | `taxId` |
| `dataNascimento` | `birthDate` |
| `documentoNome` | `documentTypeName` |
| `cartorioNome` | `notaryOfficeName` |
| status | `PENDING` / `IN_PROGRESS` / `COMPLETED` / `CANCELLED` |

### Códigos de erro

`VALIDACAO`→`VALIDATION`, `NAO_ENCONTRADO`→`NOT_FOUND`, `PAR_CARTORIO_DOCUMENTO_INVALIDO`→`INVALID_OFFICE_DOCUMENT_PAIR`, `NOME_DUPLICADO`→`DUPLICATE_NAME`, `RECURSO_EM_USO`→`RESOURCE_IN_USE`, `ERRO_INTERNO`→`INTERNAL_ERROR`, `REDE`→`NETWORK`.

> `ApiError.doCampo` → `fieldError`; `aplicarErroNoFormulario` → `applyApiErrorToForm`; `MapaDeConflito` → `ConflictFieldMap`.

## Renomes de arquivo e pasta

| antes | agora |
|---|---|
| `app/cartorios/**` | `app/notary-offices/**` |
| `app/documentos/**` | `app/document-types/**` |
| `components/cartorios/` | `components/notaryOffices/` |
| `components/documentos/` | `components/documentTypes/` |
| `components/pedido/` | `components/order/` |
| `contexts/PedidoContext.tsx` | `contexts/OrderContext.tsx` — `OrderProvider`, `useOrder()` |
| `contexts/ToastContext.tsx` | mantém o nome; API interna em inglês |
| `hooks/useBuscaCep.ts` | `hooks/useZipCodeLookup.ts` |
| `hooks/useCepMask.ts` | `hooks/useZipCodeMask.ts` |
| `hooks/useCpfCnpjMask.ts` | `hooks/useTaxIdMask.ts` |
| `lib/viacep.ts` | `lib/viaCep.ts` — `buscarCep` → `lookupZipCode` |
| `lib/formatarData.ts` | `lib/formatDate.ts` |
| `lib/constants/ufs.ts` | `lib/constants/states.ts` |
| `components/pedido/FormAgendamento.tsx` | `components/order/DocumentRequestForm.tsx` |
| `components/pedido/CartaoAgendamento.tsx` | `components/order/DocumentRequestCard.tsx` |
| `components/pedido/CabecalhoPedido.tsx` | `components/order/OrderHeader.tsx` |
| `components/pedido/TelaPedido.tsx` | `components/order/OrderScreen.tsx` |
| `components/pedido/CampoDocumento.tsx` | `components/order/TaxIdField.tsx` |

Traduzir também nomes internos: `carregandoLista`→`loadingList`, `salvando`→`saving`, `irParaPagina`→`goToPage`, `criarAgendamento`→`createRequest`, `excluirAgendamento`→`deleteRequest`, `documentosDoCartorio`→`officeDocumentTypes`, `carregarDocumentosDoCartorio`→`loadOfficeDocumentTypes`, `cartorios`→`notaryOffices`, `pedido`→`order`, `agendamentos`→`requests`, `total`→`total`, `sucesso`/`erro` do toast→`success`/`error`.

> **macOS tem sistema de arquivos case-insensitive.** Renomear `pedido` → `Pedido` exige passo intermediário. Como aqui os nomes mudam de verdade, não deve dar problema — mas confira se algum arquivo sumiu.

## O que NÃO traduz

- **Todo texto visível continua em português**: rótulos, títulos, `placeholder`, `aria-label`, mensagens de toast, textos de estado vazio, o modal de exclusão
- Comentários **traduzem** para inglês

Exemplos que devem continuar exatamente assim:
`"Nenhum documento criado"` · `"Documento criado com sucesso"` · `"Confirmar exclusão"` · `"Adicionar documentos ao pedido"` · `"1 documento solicitado"` · `"Escolha um cartório para ver os documentos que ele emite."` · `"CEP não encontrado. Preencha o endereço manualmente."` · `"Dados do cartório"` · `"Razão social"` · `"Pessoa física"` / `"Pessoa jurídica"`

Links do menu continuam `Pedido`, `Cartórios`, `Documentos`.

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose up -d --build
```

- [ ] `npm run build` sem erro de tipo
- [ ] `/` mostra `Pedido #1` com lead, observação e badge
- [ ] Escolher **Tabelionato de Notas** → combo oferece só Escritura Pública e Procuração
- [ ] Escolher um documento, trocar para **1º Ofício** → seleção **limpa**, lista passa a 6
- [ ] Bloco "Dados do cartório" preenche ao escolher
- [ ] Criar com CPF `111.444.777-35` → cartão aparece, título `1 documento solicitado`
- [ ] Pessoa jurídica com `12.abc.345/01de-35` → cartão mostra `12.ABC.345/01DE-35` e `Razão social:`
- [ ] Excluir pelo modal → cartão some, contagem cai, toast verde
- [ ] `/notary-offices` lista 4 com contagem 6 / 3 / 3 / 2
- [ ] `/notary-offices/new`: CEP `01310100` autopreenche; `00000000` avisa em português
- [ ] `/document-types` lista 6; nome duplicado → erro **sob o campo**, em português
- [ ] `grep -rniE "cartorio|documento[A-Z]|pedido|agendamento" app components hooks lib contexts` só acha **string de interface**
- [ ] Nenhum texto de tela em inglês

**Apague o que criar nos testes.**
