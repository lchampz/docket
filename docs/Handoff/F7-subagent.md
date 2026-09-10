# F7 · subagent — Modernização do backend

Projeto: `~/Documents/dev/docket/backend`. Java 21, Spring Boot 3.5.5.

**Refactor puro. O contrato REST não pode mudar em nada** — o `/v3/api-docs` de antes e o de depois serão comparados byte a byte.

---

## 1 · `pom.xml`

Adicionar `lombok` (provided), `mapstruct` e `mapstruct-processor`.

No `maven-compiler-plugin`, declarar `annotationProcessorPaths` **nesta ordem**:

1. `lombok`
2. `lombok-mapstruct-binding`
3. `mapstruct-processor`

> Fora dessa ordem o MapStruct não enxerga os getters que o Lombok gera, e a compilação falha com "property has no accessor".

Manter `<release>21</release>`.

## 2 · Entidades — `Cartorio`, `Documento`, `Pedido`, `Agendamento`

Trocar getters e setters manuais por `@Getter @Setter @NoArgsConstructor @AllArgsConstructor`.

**Proibido nas entidades:**

| Anotação | Por quê |
|---|---|
| `@Data` | Gera `equals`/`hashCode` sobre todos os campos, inclusive associações lazy → `LazyInitializationException` ao comparar e `Set` quebrado |
| `@EqualsAndHashCode` | Mesma coisa |
| `@ToString` | Percorre associações lazy ao logar |
| `@Builder` | `Pedido.numero` é gerado pelo banco (`insertable = false`); builder reabre caminho para escrevê-lo |

**Os métodos `equals` e `hashCode` escritos à mão ficam exatamente como estão.** Eles comparam por `id`, exigem `id != null` e usam `hashCode` constante por classe — foi correção deliberada, não descuido.

Nada de anotação Lombok nos enums.

## 3 · Services, controllers e mappers

- Construtor manual → `@RequiredArgsConstructor` com os campos `private final`
- Logger manual (`LoggerFactory.getLogger`) → `@Slf4j`, usando `log`

`ManipuladorDeErros` tem logger; converter também.

## 4 · Mappers com MapStruct

Converter `CartorioMapper`, `DocumentoMapper`, `PedidoMapper` e `AgendamentoMapper` para interfaces MapStruct:

```java
@Mapper(componentModel = "spring")
public interface DocumentoMapper { ... }
```

Regras:
- `AgendamentoResponse` é **achatado**: os campos do cartório vêm de `agendamento.cartorio.*` e o nome do documento de `agendamento.documento.nome`. Usar `@Mapping(target = "cartorioNome", source = "cartorio.nome")` e afins
- `CartorioResponse.totalDocumentos` continua derivado do tamanho da coleção — `expression` ou `default method`
- Onde a conversão exigir regra (normalização de documento, resolução de `documentoIds`), **manter no service**. Mapper não é lugar de regra de negócio
- Se algum mapeamento ficar tortuoso no MapStruct, deixe aquele método como `default` escrito à mão e siga. Contorcer configuração para evitar cinco linhas de Java é troca ruim

## 5 · Virtual threads

Em `application.yml`, no bloco comum:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

Java 21 + Boot 3.2+ passam a atender requisição em virtual thread.

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose up -d --build
```

- [ ] Backend sobe `healthy` — `ddl-auto: validate` provando que o mapeamento não mudou
- [ ] `curl -s localhost:8080/api/v1/documentos` → 6 itens, `size` 10
- [ ] `curl -s localhost:8080/api/v1/cartorios/4/documentos` → só Escritura Pública e Procuração
- [ ] `curl -s localhost:8080/api/v1/cartorios` → `totalDocumentos` 6 / 3 / 3 / 2
- [ ] POST agendamento com `cartorioId=4, documentoId=1` → `409 PAR_CARTORIO_DOCUMENTO_INVALIDO`
- [ ] POST com CPF `11144477734` → `400`, `errors[0].campo == "documentoIdentificacao"`
- [ ] POST documento `"certidão de nascimento"` → `409 NOME_DUPLICADO`
- [ ] `GET /pedidos/1/agendamentos` → payload achatado com `cartorioNome`, `cep`, `rua`, `cidade`, `uf`
- [ ] `localhost:8080/cartorios` (Thymeleaf) lista, cadastra e exclui
- [ ] `grep -rn "@Data\|@EqualsAndHashCode\|@ToString\|@Builder" src/main/java` → **vazio**
- [ ] `grep -rn "public .*get[A-Z]" src/main/java/com/docket/cartorio/Cartorio.java` → **vazio** (getters agora são do Lombok)
- [ ] `equals`/`hashCode` das 4 entidades continuam escritos à mão

**Limpe qualquer registro criado nos testes.**
