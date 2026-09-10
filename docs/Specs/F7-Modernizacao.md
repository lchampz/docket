---
fase: 7
estado: fechada
depende: [F6]
---

# F7 · Modernização do backend

**Objetivo** — Reduzir cerimônia com Lombok, MapStruct e virtual threads, **sem mudar uma linha do contrato REST**.

**Contexto necessário** — `Contexto/Arquitetura.md`, `Contexto/Decisoes.md` D23

## Por que agora, e não depois dos testes

Refatorar depois de escrever a suíte obrigaria a reescrever os testes junto. A rede de segurança desta fase é a verificação e2e que já existe (Swagger, os checks HTTP das F2/F3 e as telas das F5/F6): **o contrato é o teste**. A F8 escreve a suíte contra a forma final.

## Tarefas

- [x] `[agent]` Decidir o alcance do Lombok por tipo de classe e registrar em `Decisoes.md`
- [x] `[subagent]` Lombok no `pom.xml` + `annotationProcessorPaths` na ordem correta
- [x] `[subagent]` `@Getter`/`@Setter`/`@NoArgsConstructor`/`@AllArgsConstructor` nas 4 entidades
- [x] `[agent]` **Conferir que `equals`/`hashCode` escritos à mão sobreviveram intactos**
- [x] `[subagent]` `@RequiredArgsConstructor` nos services, controllers e mappers
- [x] `[subagent]` `@Slf4j` onde há logger manual
- [x] `[subagent]` MapStruct nos 4 mappers, com `lombok-mapstruct-binding`
- [x] `[subagent]` `spring.threads.virtual.enabled: true`
- [x] `[agent]` Reexecutar a verificação e2e das F2 e F3 e comparar respostas

## Critério de aceite

- **Nenhuma mudança no `/v3/api-docs`** — diff do schema antes e depois vazio
- Todas as checagens HTTP da F2 continuam com os mesmos status e códigos
- `/cartorios` (Thymeleaf) continua funcionando ponta a ponta
- Backend sobe com `ddl-auto: validate`, provando que o mapeamento não mudou
- `grep -rn "@Data\|@EqualsAndHashCode\|@Value" src/main/java` → **vazio**

## Armadilhas

- **`@Data` em entidade JPA** gera `equals`/`hashCode` sobre todos os campos, inclusive associações lazy: `LazyInitializationException` ao comparar, e `Set` quebrado. É exatamente o bug corrigido na F1
- **Ordem dos annotation processors**: Lombok antes de MapStruct, com `lombok-mapstruct-binding` no meio, senão o MapStruct não enxerga os getters gerados
- **DTOs continuam `record`.** Lombok neles é retrocesso
- `@Builder` em entidade com campo gerado pelo banco (`pedido.numero`) pode reintroduzir escrita indevida — conferir
