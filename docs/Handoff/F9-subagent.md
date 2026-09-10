# F9 · subagent — Testes

Projeto: `~/Documents/dev/docket`.

## Já pronto, use como referência e não reescreva

| Arquivo | O que é |
|---|---|
| `backend/src/test/java/com/docket/shared/PostgresIntegrationTest.java` | Base com Testcontainers (Postgres 16 real, container estático) |
| `backend/src/test/java/com/docket/agendamentos/AgendamentoIntegracaoTest.java` | 5 testes de integração, incluindo trava de N+1 |
| `backend/src/test/resources/application-test.yml` | Perfil `test` |

Testcontainers, `spring-boot-testcontainers` e `postgresql` já estão no `pom.xml`.

**Todo teste que cria dado tem que apagar no `finally`.** O seed é 4 cartórios / 6 documentos / 0 agendamentos, e a suíte não pode depender de ordem de execução.

---

## 1 · Backend — teste unitário de `Documentos` (sem Spring)

`backend/src/test/java/com/docket/shared/validation/DocumentosTest.java`, com `@ParameterizedTest` onde couber.

**CPF** — válidos `11144477735`, `52998224725`; dígito errado `11144477734`; repetidos `11111111111` e `00000000000`; curto `1114447773`; nulo; CNPJ no lugar de CPF.

**CNPJ alfanumérico** (IN RFB 2.229/2024 — 12 caracteres `[A-Z0-9]` + 2 dígitos):
- válidos: `11222333000181`, `11444777000161`, **`12ABC34501DE35`**
- dígito errado: `12ABC34501DE34`
- minúsculo cru **rejeitado**: `12abc34501de35` (só é aceito depois de normalizar)
- letra no dígito verificador rejeitada: `12ABC34501DEA5`
- repetido `11111111111111`

**Normalização** — `normalize("12.abc.345/01de-35")` → `12ABC34501DE35`; `normalize("111.444.777-35")` → `11144477735`. E `onlyDigits` **não** serve para CNPJ: `onlyDigits("12ABC34501DE35")` devolve `123450135`, e deve existir um teste registrando isso como comportamento esperado da função errada para o caso.

## 2 · Backend — serviços

`CartorioServiceTest` e `DocumentoServiceTest`, estendendo `PostgresIntegrationTest`:

- Nome de documento duplicado ignorando caixa → `ConflictException` com `ErrorCode.NOME_DUPLICADO`
- Atualizar documento mantendo o próprio nome **não** dá conflito
- Excluir cartório com agendamento → `RECURSO_EM_USO` (criar o agendamento, testar, limpar)
- Excluir cartório sem agendamento funciona (**criar um cartório novo para isso, nunca usar os do seed**)
- `documentoIds` com id inexistente → `ResourceNotFoundException`
- `listDocumentos(4)` devolve exatamente Escritura Pública e Procuração

## 3 · Backend — `@WebMvcTest` dos controllers

Um por controller, com `MockMvc` e service mockado (`@MockitoBean`). Checar **status e forma do corpo**, não regra:

- `POST /api/v1/documentos` com `{}` → `400`, corpo com `codigo == "VALIDACAO"` e `errors[]` não vazio
- `GET /api/v1/documentos` → `200` com envelope `content`, `page`, `size`, `totalElements`
- `POST /api/v1/cartorios` válido → `201` com header `Location`
- `DELETE /api/v1/agendamentos/{id}` → `204`
- Service lançando `ResourceNotFoundException` → `404` com `codigo == "NAO_ENCONTRADO"`
- Service lançando `ConflictException` → `409` com o código correspondente

## 4 · Frontend — Vitest

Instalar `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`. Configurar `vitest.config.ts` com ambiente `jsdom` e script `"test": "vitest run"`.

**`hooks/useCpfCnpjMask`**
- CPF: `11144477735` → `111.444.777-35`
- CNPJ: `12abc34501de35` → `12.ABC.345/01DE-35`
- Editar no meio de um CPF preenchido **não joga o cursor para o fim**
- Trocar `tipoPessoa` limpa o valor

**`hooks/useCepMask`** — `01310100` → `01310-100`; descarta não-dígito.

**`lib/viaCep`** — com `fetch` mockado:
- resposta normal → `{ tipo: "ok" }` com os campos preenchidos
- **`200` com `{"erro": true}` → `nao-encontrado`** (não `ok`)
- `{"erro": "true"}` como string → também `nao-encontrado`
- `fetch` rejeitando → `indisponivel`
- CEP com menos de 8 dígitos não chama `fetch`

**`lib/api/formErrors`** — `applyApiErrorToForm`:
- `ApiError` de validação com `errors[]` → chama `setError` por campo e devolve `null`
- `409 NOME_DUPLICADO` com mapa `{ NOME_DUPLICADO: "nome" }` → cai no campo, devolve `null`
- `409` sem mapa → devolve a mensagem para toast
- erro que não é `ApiError` → devolve mensagem genérica

**Combo condicional** — testar a lógica de `PedidoContext`: trocar de cartório limpa a seleção de documento e recarrega a lista.

## 5 · Lint

`npm run lint` sem erro no front. `mvn -B test` verde no backend.

---

## Verificação

```bash
cd ~/Documents/dev/docket/backend && mvn -B test
cd ../frontend && npm test && npm run lint
```

- [ ] Backend verde, **incluindo os 5 testes que já existem**
- [ ] Front verde
- [ ] `docker compose exec -T db psql -U docket -d docket -tAc "select count(*) from agendamento"` → **0** depois da suíte
- [ ] Contagens do seed intactas: 4 cartórios, 6 documentos, 14 vínculos
- [ ] Nenhum teste depende de ordem de execução — rodar duas vezes seguidas dá o mesmo resultado

Se algum teste revelar bug no código de produção, **corrija o código, não o teste** — e diga qual bug era.
