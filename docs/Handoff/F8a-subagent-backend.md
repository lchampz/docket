# F8a · subagent — Tradução do backend

Projeto: `~/Documents/dev/docket/backend`. Java 21, Spring Boot 3.5.5, Lombok + MapStruct.

**Renomeação. Nenhuma regra de negócio muda.** O banco continua em pt-BR e as migrations **não podem ser tocadas**.

## Glossário — obrigatório, não sugestão

| pt-BR | inglês |
|---|---|
| `Cartorio` | `NotaryOffice` |
| `Documento` | **`DocumentType`** |
| `Pedido` | `Order` |
| `Agendamento` | **`DocumentRequest`** |
| `TipoPessoa` | `PersonType` — valores `INDIVIDUAL` / `COMPANY` |
| `StatusPedido` | `OrderStatus` — `IN_PROGRESS` / `COMPLETED` / `CANCELLED` |
| `StatusAgendamento` | `RequestStatus` — `PENDING` / `IN_PROGRESS` / `COMPLETED` / `CANCELLED` |
| `nomeRazaoSocial` | `legalName` |
| `documentoIdentificacao` | `taxId` |
| `dataNascimento` | `birthDate` |
| `criadoPor` | `createdBy` |
| `observacao` | `notes` |
| `numero` (do pedido) | `number` |
| `cep` / `rua` / `numero` / `bairro` / `cidade` / `uf` | `zipCode` / `street` / `number` / `district` / `city` / `state` |
| `nome` | `name` |
| `documentoIds` | `documentTypeIds` |
| `totalDocumentos` | `totalDocumentTypes` |
| `totalAgendamentos` | `totalRequests` |

Pacotes: `cartorio`→`notaryoffice`, `documento`→`documenttype`, `pedido`→`order`, `agendamento`→`documentrequest`, `shared`→`shared`, `web`→`web`.

Classes de apoio: `ManipuladorDeErros`→`ErrorHandler`, `CodigoErro`→`ErrorCode`, `ConflitoException`→`ConflictException`, `RecursoNaoEncontradoException`→`ResourceNotFoundException`, `ErroCampo`→`FieldError`, `Documentos`→`TaxIds`, `IdentificacaoCoerente`→`ConsistentTaxId`, `PossuiIdentificacao`→`HasTaxId`, `CartorioForm`→`NotaryOfficeForm`.

Códigos de erro: `VALIDACAO`→`VALIDATION`, `NAO_ENCONTRADO`→`NOT_FOUND`, `PAR_CARTORIO_DOCUMENTO_INVALIDO`→`INVALID_OFFICE_DOCUMENT_PAIR`, `NOME_DUPLICADO`→`DUPLICATE_NAME`, `RECURSO_EM_USO`→`RESOURCE_IN_USE`, `ERRO_INTERNO`→`INTERNAL_ERROR`.

## Rotas REST — traduzem

```
/api/v1/notary-offices[/{id}]                    ?page&size&name
/api/v1/notary-offices/{id}/document-types
/api/v1/document-types[/{id}]                    ?page&size   (size default 10)
/api/v1/orders[/{id}]                            ?page&size&status
/api/v1/orders/{id}/document-requests            GET e POST
/api/v1/document-requests/{id}                   GET e DELETE
/api/v1/document-requests/{id}/status            PATCH
```

Thymeleaf continua em `/notary-offices` (era `/cartorios`), e `/` redireciona para lá.

## O banco NÃO muda

`git diff src/main/resources/db/migration/` tem que ficar **vazio**.

Consequência: **toda entidade precisa de `@Table(name = "...")` e toda propriedade de `@Column(name = "...")`** apontando para os nomes em português. Exemplos:

```java
@Entity @Table(name = "cartorio")
public class NotaryOffice {
    @Column(name = "nome")     private String name;
    @Column(name = "cep")      private String zipCode;
    @Column(name = "rua")      private String street;
    @Column(name = "uf")       private String state;
    ...
}
```

`DocumentRequest`: `@Table(name = "agendamento")`, `@Column(name = "nome_razao_social") legalName`, `@Column(name = "documento_identificacao") taxId`, `@Column(name = "tipo_pessoa") personType`, `@JoinColumn(name = "pedido_id") order`, `@JoinColumn(name = "cartorio_id") notaryOffice`, `@JoinColumn(name = "documento_id") documentType`.

`NotaryOffice` ↔ `DocumentType`: `@JoinTable(name = "cartorio_documento", joinColumns = @JoinColumn(name = "cartorio_id"), inverseJoinColumns = @JoinColumn(name = "documento_id"))`.

`Order.number`: continua `@Column(name = "numero", insertable = false, updatable = false)` com `@Generated`.

**Os enums são persistidos como `@Enumerated(STRING)` e o banco tem `CHECK` com os valores em português** (`FISICA`, `JURIDICA`, `PENDENTE`, …). Como os nomes das constantes mudam para inglês, isso quebraria.

> **Solução obrigatória:** criar `V5__enums_em_ingles.sql` que faz `UPDATE` dos valores existentes **e** troca os `CHECK` para os valores em inglês. Só os valores dos enums mudam; **nome de tabela e de coluna continuam em português**. Ajustar `R__seed.sql` para os novos valores.

## O que NÃO traduz

- **Mensagens de validação e de erro**: `"Informe o nome do cartório"`, `"CPF inválido"`, `"O cartório informado não emite esse documento."` continuam em português. São texto de usuário
- **Texto visível nos templates Thymeleaf** — só os nomes de atributo de modelo viram inglês
- Nomes de tabela, coluna e constraint
- `R__seed.sql`, exceto os valores de enum

## Também traduz

- Todos os comentários e Javadoc
- `@Tag` / `@Operation` do springdoc

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose down -v && docker compose up -d --build
```

- [ ] Backend `healthy` com `ddl-auto: validate` — prova que o mapeamento para o banco pt-BR está certo
- [ ] `git diff --stat src/main/resources/db/migration/` mostra **só** o `V5` novo e o `R__seed.sql`
- [ ] `GET /api/v1/document-types` → 6 itens, `size` 10
- [ ] `GET /api/v1/notary-offices` → `totalDocumentTypes` 6 / 3 / 3 / 2
- [ ] `GET /api/v1/notary-offices/4/document-types` → Escritura Pública e Procuração
- [ ] `POST /api/v1/orders/1/document-requests` com `notaryOfficeId=4, documentTypeId=1` → `409` com `"codigo":"INVALID_OFFICE_DOCUMENT_PAIR"`
- [ ] Mesmo POST com `notaryOfficeId=1, documentTypeId=1`, `personType=INDIVIDUAL`, `taxId="111.444.777-35"` → `201`, `status` `PENDING`
- [ ] `taxId` `"111.444.777-34"` → `400` com `errors[0].campo == "taxId"` e mensagem **em português**
- [ ] `POST /api/v1/document-types` com `"certidão de nascimento"` → `409 DUPLICATE_NAME`
- [ ] `POST /api/v1/notary-offices` com `{}` → `400` com **7 mensagens em português**
- [ ] `localhost:8080/notary-offices` (Thymeleaf) lista, cadastra e exclui, **com a tela em português**
- [ ] `grep -rniE "cartorio|agendamento|pedido" src/main/java` só acha `@Table`/`@Column`/`@JoinColumn` e comentários sobre o banco

**Limpe o que criar nos testes.** O front vai estar quebrado ao fim desta etapa — é esperado, a próxima etapa cuida dele.
