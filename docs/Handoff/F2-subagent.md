# F2 · subagent — CRUD backend

Projeto: `~/Documents/dev/docket/backend`. Entidades, repositories e migrations da F1 já existem — **não alterar migration nenhuma**.

## Já pronto, use e não reescreva

| Classe | Uso |
|---|---|
| `shared.error.RecursoNaoEncontradoException(String recurso, Object id)` | → `404` |
| `shared.error.ConflitoException(CodigoErro, String)` | → `409` |
| `shared.error.CodigoErro` | `PAR_CARTORIO_DOCUMENTO_INVALIDO`, `NOME_DUPLICADO`, `RECURSO_EM_USO`, … |
| `shared.error.ManipuladorDeErros` | `@RestControllerAdvice` único. **Não criar outro handler** |
| `shared.web.PageResponse.de(Page<T>)` | Envelope de paginação. **Nunca devolver `Page` do Spring** |
| `shared.validation.Documentos.somenteDigitos(String)` | Desmascarar CPF/CNPJ |
| `agendamento.validation.IdentificacaoCoerente` + `PossuiIdentificacao` | Constraint de classe do DTO de agendamento |

Serviço lança exceção; controller nunca monta corpo de erro à mão.

---

## 1 · DTOs (records) — `com.docket.<feature>.dto`

**`CartorioRequest`** — `nome` `@NotBlank @Size(max=150)` · `cep` `@NotBlank @Pattern("^\\d{8}$")` · `rua` `@NotBlank` · `numero` `@NotBlank` · `complemento` · `bairro` · `cidade` `@NotBlank` · `uf` `@NotBlank @Pattern("^[A-Z]{2}$")` · `documentoIds` `Set<Long> @NotNull`

**`CartorioResponse`** — `id` · `nome` · `cep` · `rua` · `numero` · `complemento` · `bairro` · `cidade` · `uf` · `documentos List<DocumentoResponse>` · `totalDocumentos int` · `createdAt`

> `totalDocumentos` é requisito explícito da diretriz ("contagem de documentos por cartório"). Derivar do tamanho da coleção, não fazer query extra.

**`DocumentoRequest`** — `nome` `@NotBlank @Size(max=150)`
**`DocumentoResponse`** — `id` · `nome` · `createdAt`

**`PedidoRequest`** — `lead` `@NotBlank @Size(max=200)` · `observacao` · `criadoPor` `@NotBlank @Size(max=150)` · `status StatusPedido` (opcional; ausente = `EM_ANDAMENTO`)
**`PedidoResponse`** — `id` · `numero` · `lead` · `observacao` · `status` · `criadoPor` · `createdAt` · `totalAgendamentos long`

**`AgendamentoRequest`** — anotado com `@IdentificacaoCoerente` na **classe** e implementando `PossuiIdentificacao`:
`cartorioId` `@NotNull` · `documentoId` `@NotNull` · `tipoPessoa` `@NotNull` · `nomeRazaoSocial` `@NotBlank @Size(max=200)` · `documentoIdentificacao` `@NotBlank` · `dataNascimento LocalDate @Past`

> Sem `status` no request. Ver regra 4.4.

**`AgendamentoResponse`** — achatado, é exatamente o card do layout:
`id` · `documentoNome` · `tipoPessoa` · `nomeRazaoSocial` · `documentoIdentificacao` (só dígitos) · `dataNascimento` · `cartorioNome` · `cep` · `rua` · `numero` · `complemento` · `bairro` · `cidade` · `uf` · `status` · `createdAt`

**`AtualizarStatusRequest`** — `status StatusAgendamento @NotNull`

## 2 · Métodos de repository

- `CartorioRepository`: `Page<Cartorio> findByNomeContainingIgnoreCase(String, Pageable)` · **`boolean existsByIdAndDocumentos_Id(Long, Long)`** (é a checagem do par) · `@EntityGraph(attributePaths="documentos")` em `findAll(Pageable)` e `findById`
- `DocumentoRepository`: `boolean existsByNomeIgnoreCase(String)` · `Optional<Documento> findByNomeIgnoreCase(String)`
- `AgendamentoRepository`: `boolean existsByCartorioId(Long)` · `boolean existsByDocumentoId(Long)` · `long countByPedidoId(Long)` · `@EntityGraph(attributePaths={"cartorio","documento"}) Page<Agendamento> findByPedidoId(Long, Pageable)`
- `PedidoRepository`: nada extra

## 3 · Services — `@Service @Transactional`

Leitura em `@Transactional(readOnly = true)`.

### 3.1 `CartorioService`
- Criar/atualizar: resolver `documentoIds` via `findAllById`; se algum id não existir → `RecursoNaoEncontradoException("Documento", id)`
- Excluir: se `agendamentoRepository.existsByCartorioId(id)` → `ConflitoException(RECURSO_EM_USO, "Cartório possui agendamentos e não pode ser excluído.")`
- `listarDocumentos(cartorioId)`: 404 se o cartório não existir; devolve os documentos que ele emite

### 3.2 `DocumentoService`
- Nome duplicado sem diferenciar caixa → `ConflitoException(NOME_DUPLICADO, "Já existe um documento com esse nome.")`. Na atualização, ignorar o próprio registro
- Excluir com agendamento → `ConflitoException(RECURSO_EM_USO, …)`
- Listagem paginada, **`size` default 10**

### 3.3 `PedidoService`
- CRUD. `numero` é gerado pelo banco: **nunca escrever**. Após `save`, recarregar ou usar `saveAndFlush` + `refresh` para o response trazer o número
- `PedidoResponse.totalAgendamentos` vem de `countByPedidoId`

### 3.4 `AgendamentoService`
Ordem obrigatória ao criar:
1. Pedido existe? senão `RecursoNaoEncontradoException("Pedido", id)`
2. Cartório e documento existem? senão 404 de cada
3. **`cartorioRepository.existsByIdAndDocumentos_Id(cartorioId, documentoId)`** — se falso → `ConflitoException(PAR_CARTORIO_DOCUMENTO_INVALIDO, "O cartório informado não emite esse documento.")`
4. `status` forçado a `PENDENTE`, **ignorando qualquer valor recebido**
5. `documentoIdentificacao` normalizado com `Documentos.somenteDigitos` antes de persistir

- `PATCH /status`: só troca o status
- Listagem por pedido: usar o `@EntityGraph`, **uma query** — não acessar `getCartorio()` em laço

## 4 · Controllers — `com.docket.<feature>.<Feature>Controller`

Rotas exatamente como abaixo. `@Valid` em todo corpo, `@Validated` na classe para validar parâmetros.

```
GET/POST/PUT/DELETE  /api/v1/cartorios[/{id}]     ?page&size&nome
GET                  /api/v1/cartorios/{id}/documentos
GET/POST/PUT/DELETE  /api/v1/documentos[/{id}]    ?page&size   (size default 10)
GET/POST/PUT/DELETE  /api/v1/pedidos[/{id}]       ?page&size&status
GET                  /api/v1/pedidos/{id}/agendamentos  ?page&size
POST                 /api/v1/pedidos/{id}/agendamentos
GET/DELETE           /api/v1/agendamentos/{id}
PATCH                /api/v1/agendamentos/{id}/status
```

- `POST` → `201` com `Location`
- `DELETE` → `204`
- Listagens → `PageResponse<T>`
- `@Tag` e `@Operation` do springdoc em cada controller

## 5 · Sem Lombok, sem MapStruct

Mappers como classes `@Component` com métodos estáticos ou de instância, escritos à mão. O projeto não tem essas dependências e **não é para adicioná-las**.

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose up -d --build
```

- [ ] `/swagger-ui` lista todas as rotas acima
- [ ] `GET /api/v1/documentos` → 6 itens, `size` 10, envelope com `totalElements`
- [ ] `GET /api/v1/cartorios/4/documentos` → só Escritura Pública e Procuração
- [ ] `POST /api/v1/pedidos/1/agendamentos` com `cartorioId=4, documentoId=1` → **`409`** com `"codigo":"PAR_CARTORIO_DOCUMENTO_INVALIDO"`
- [ ] Mesmo POST com `cartorioId=1, documentoId=1`, CPF `111.444.777-35`, `FISICA` → **`201`**, e o response traz `documentoIdentificacao: "11144477735"` (sem máscara) e `status: "PENDENTE"`
- [ ] Repetir com `"status":"CONCLUIDO"` no corpo → nasce `PENDENTE` mesmo assim
- [ ] CPF `111.444.777-34` (dígito errado) → **`400`** com `errors[].campo == "documentoIdentificacao"`
- [ ] `FISICA` com CNPJ → **`400`**
- [ ] `POST /api/v1/documentos` com `"certidão de nascimento"` → **`409`** `NOME_DUPLICADO`
- [ ] `DELETE /api/v1/cartorios/1` com agendamento → **`409`** `RECURSO_EM_USO`
- [ ] `GET /api/v1/pedidos/1` → `totalAgendamentos` correto
- [ ] Log da listagem de agendamentos: **uma** query, não N+1 (`spring.jpa.show-sql=true` temporário se precisar)

**Limpe o que criar durante os testes.** Deixar registro de teste no banco falsifica a contagem do seed.
