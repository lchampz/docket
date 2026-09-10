---
fase: 8
estado: fechada
depende: [F7]
---

# F8 · Tradução para inglês

**Objetivo** — Todo identificador de código em inglês. **Banco e interface continuam em pt-BR.**

**Contexto necessário** — `Contexto/Dominio.md`, `Contexto/Contrato-API.md`, este glossário

## O que traduz e o que não traduz

| | Idioma | Por quê |
|---|---|---|
| Classes, métodos, variáveis, pacotes | **inglês** | Convenção da indústria |
| Comentários e Javadoc | **inglês** | Acompanham o código |
| **Tabelas e colunas do banco** | pt-BR | Decisão do Victor; migrations já aplicadas |
| **Texto de interface** | pt-BR | O produto é brasileiro |
| **Mensagens de validação e de erro** | pt-BR | São texto de interface, chegam ao usuário |
| Seed | pt-BR | É dado, não código |
| Vault `/docs` | pt-BR | Documentação do autor |
| **Rotas REST** | ver abaixo | Decisão consciente |

## Glossário do domínio

| pt-BR | inglês |
|---|---|
| Cartório | `NotaryOffice` |
| Documento | `DocumentType` |
| Pedido | `Order` |
| Agendamento | `DocumentRequest` |
| Tipo de pessoa | `PersonType` (`INDIVIDUAL` / `COMPANY`) |
| Nome / razão social | `legalName` |
| Documento de identificação (CPF/CNPJ) | `taxId` |
| Data de nascimento | `birthDate` |
| Status | `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) |
| Lead | `lead` |
| Observação | `notes` |
| Criado por | `createdBy` |
| Cep / rua / número / bairro / cidade / uf | `zipCode` / `street` / `number` / `district` / `city` / `state` |

> `Documento` virou **`DocumentType`**, não `Document`: a entidade é o *tipo* de certidão que um cartório emite, não um documento emitido. O nome em pt-BR sempre foi ambíguo; a tradução é a chance de corrigir.

> `Agendamento` virou **`DocumentRequest`**. "Agendamento" nunca descreveu bem o que é — não há data agendada. É a solicitação de um documento dentro de um pedido.

## Consequência inevitável: mapeamento explícito

Com campo em inglês e coluna em pt-BR, **toda propriedade passa a exigir `@Column(name = "...")`** e cada entidade um `@Table(name = "...")`. Hoje os nomes coincidem e a maior parte é implícita.

Isso é ruído novo no código, e é o preço da decisão de manter o banco em pt-BR. Registrar no README para não parecer descuido.

O mesmo vale no front: os tipos de `lib/api/types.ts` seguem o **JSON da API**, não o idioma do código.

## Pacotes Java — uma palavra, no plural

`offices` · `documents` · `requests` · `orders` · `shared` · `web`

Convenção Java manda pacote todo em minúsculas, sem separador — o que torna `notaryoffice` ilegível. A saída idiomática é **pacote de uma palavra só, no plural**, com a precisão morando no nome da classe: `com.docket.offices.NotaryOffice`, `com.docket.documents.DocumentType`, `com.docket.requests.DocumentRequest`.

## Rotas REST

`/api/v1/cartorios` etc. fazem parte do contrato público e aparecem no README e no Swagger.

**Decisão: traduzir também** (`/api/v1/notary-offices`, `/document-types`, `/orders`, `/document-requests`), porque metade em inglês e metade em português seria pior que qualquer um dos extremos. O front acompanha.

## Tarefas

- [x] `[agent]` Fixar o glossário e registrar em `Decisoes.md`
- [x] `[agent]` Baseline: snapshot do `/v3/api-docs` e das respostas **antes** de qualquer renome
- [x] `[subagent]` Backend: pacotes, classes, campos, métodos e comentários
- [x] `[subagent]` `@Table` / `@Column` explícitos apontando para os nomes pt-BR do banco
- [x] `[subagent]` Rotas REST e `@Tag`/`@Operation` do springdoc
- [x] `[subagent]` Templates Thymeleaf: nomes de atributo de modelo em inglês, **texto visível em pt-BR**
- [x] `[subagent]` Frontend: componentes, hooks, contexts, tipos e funções
- [x] `[agent]` Conferir que nenhuma mensagem de usuário virou inglês
- [x] `[agent]` Verificação e2e completa e diff de comportamento

## Critério de aceite

- Backend sobe com `ddl-auto: validate` — prova que o mapeamento para o banco pt-BR está certo
- Migrations **não mudaram**: `git diff` em `db/migration/` vazio
- Nenhum identificador em português no código: `grep -rniE "cartorio|documento|pedido|agendamento|cep|nome" --include=*.java --include=*.ts --include=*.tsx` só acha string de interface, nome de coluna e comentário sobre o banco
- Toda tela continua em português
- Fluxo completo do front funciona: combo condicional, criar, excluir
- `/cartorios` (Thymeleaf) continua funcionando

## Armadilhas

- **Mensagem de validação é texto de usuário.** `"Informe o nome do cartório"` continua em português
- Renomear pacote quebra import em cascata; conferir `web/` e `shared/`, que atravessam features
- O front tem nome de campo vindo do JSON (`documentoIdentificacao` → `taxId`): mudar os dois lados **na mesma passada**, senão o formulário quebra silenciosamente
- `aplicarErroNoFormulario` mapeia `codigo` → campo; os códigos de erro também mudam de idioma
