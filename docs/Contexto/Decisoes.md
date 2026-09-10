# Decisões

Uma linha por decisão que sobrevive à fase em que nasceu. Formato: contexto → escolha → consequência.

---

**D1 · Diretriz vence enunciado oficial** · 2026-09-09
Três fontes conflitam (Diretriz.md, README backend, README front + XD). A diretriz do Victor é a autoridade.
→ `json-server` descartado (front consome a API Spring); Java 8/H2 descartados (Java 21 + Postgres); Thymeleaf e React coexistem.

**D2 · `Agendamento` ganha `nomeRazaoSocial` e `dataNascimento`** · 2026-09-09
O card do XD e o README oficial do front exigem "Nome da pessoa (PF) ou razão social (PJ)"; a tabela da diretriz não previa.
→ Dois campos a mais que a diretriz. Sem eles a tela não tem o que renderizar.

**D3 · `Pedido` é entidade de verdade** · 2026-09-09
O layout inteiro gira em torno de `Pedido #1` com lead, observação, status e autor. A diretriz não modela Pedido.
→ Quinta tabela, `agendamento.pedido_id`, rotas aninhadas. **Única ampliação deliberada além da diretriz** — precisa de uma linha no README justificando, porque um avaliador que compare modelo e enunciado vai notar.

**D4 · Next.js + Tailwind** · 2026-09-09
Diretriz pede "React/TS", enunciado oficial pede "Nextjs/React + Tailwind".
→ Next.js atende às duas de uma vez. Vite descartado.

**D5 · Thymeleaf entrega CRUD completo de cartórios** · 2026-09-09
O React é a interface principal, mas o requisito obrigatório do desafio backend é explícito sobre Thymeleaf.
→ `/cartorios` server-rendered, mesmo `Service` do REST. Não é placeholder.

**D6 · API de certidões do enunciado está morta** · 2026-09-09
`docketdesafiobackend.herokuapp.com` fora do ar (Heroku free desligado). Era requisito opcional.
→ Substituída por seed local em migration. Registrar no README para não parecer requisito ignorado.

**D7 · Vault é a única fonte de verdade documental** · 2026-09-09
`PLANNING.md` na raiz do projeto duplicava o que o vault vai conter.
→ Removido. O vault sobe como `/docs`; a narrativa emailável vive em `docs/Planejamento.md`.

**D8 · Vault vira `/docs` por cópia no fechamento** · 2026-09-09
Symlink quebra para quem clona o repo; submodule adiciona cerimônia para um vault de documentos.
→ O vault é editado no Obsidian e copiado para `docs/` na F8, por script. `docs/` é snapshot publicado, não área de trabalho. Editar `docs/` direto é erro — a próxima cópia sobrescreve.

**D9 · Front fala com o backend por rewrite do Next, não por CORS** · 2026-09-09
No compose, o navegador resolve `localhost:8080` e o container resolve `backend:8080` — o mesmo env var não serve aos dois, e é a origem clássica de "funciona no meu, quebra no Docker".
→ O front sempre chama caminho relativo (`/api/...`); o Next reescreve para `BACKEND_INTERNAL_URL` do lado do servidor. Sem CORS, sem URL absoluta no bundle. O backend segue publicado em `:8080` para Swagger, Thymeleaf e `curl` do avaliador.

**D10 · Papéis `agent` / `subagent` em vez de nomes de produto** · 2026-09-09
As specs falavam em "Claude" e "Cursor", amarrando a documentação a duas ferramentas específicas.
→ Vocabulário passa a descrever o **perfil de modelo**: `agent` (caro, raciocínio longo, decide) e `subagent` (rápido, barato, especializado em código, executa). Hoje mapeiam para Claude Code e `cursor-agent`; trocar a implementação não muda nenhuma spec.

**D11 · O agent dispara o subagent pelo terminal** · 2026-09-09
Entregar um arquivo para o humano colar no Cursor põe uma pessoa no meio de um handoff entre máquinas.
→ `cursor-agent -p --force --model composer-2.5 "$(cat Handoff/F<n>-subagent.md)"`, rodado pelo agent, que lê o resultado e **verifica contra o critério de aceite antes de marcar checkbox**. Modelo sempre explícito: `auto` esconde o que rodou e torna o resultado irreprodutível. Escalada em caso de falha: `composer-2.5` → `gpt-5.3-codex` → reescrever a spec (terceira falha é defeito de spec, não de modelo).

**D12 · Sem constraint de agendamento duplicado** · 2026-09-09
O plano previa índice único parcial impedindo o mesmo documento, para o mesmo requerente, no mesmo cartório e pedido.
→ **Removido.** Pedir duas vias da mesma certidão é ação legítima — a empresa emite 2ª via, é o negócio dela. Nenhuma das três fontes pede unicidade. A constraint transformaria um caso de uso real em `409`, e um avaliador testando "adicionar duas vezes" leria isso como bug. Regra inventada que bloqueia ação plausível é pior que ausência de regra.

**D13 · `RESTRICT` em cartório e documento, `CASCADE` em pedido** · 2026-09-09
Pergunta que a F2 tinha em aberto, mas o schema precisa da resposta antes.
→ Agendamento é fato histórico: segura a exclusão do cartório e do documento (`409` com explicação). O vínculo `cartorio_documento` é acessório e some junto (`CASCADE`). Pedido é dono dos seus agendamentos e leva todos consigo.

**D14 · `pedido.numero` vem de sequence, decidido já na F1** · 2026-09-09
Estava listado como tarefa da F2, mas é decisão de schema.
→ Sequence dedicada com `DEFAULT nextval(...)`. `count()+1` tem condição de corrida e reaproveita número após exclusão.

**D15 · Seed abre o app no estado vazio** · 2026-09-09
Semear agendamentos mostraria a tela cheia logo de cara, mas esconderia o empty state — que é requisito avaliado.
→ Seed traz 4 cartórios, 6 documentos, vínculos N:N **desiguais** e 1 pedido **sem agendamentos**. O avaliador abre no empty state e cria o primeiro registro, percorrendo o fluxo inteiro. Os combos já têm conteúdo para isso.

**D16 · XD é consultado ao vivo; PNG é contingência** · 2026-09-09
O plano mandava exportar as 9 telas antes da F4, por medo de o link cair.
→ Invertido: o link é a referência de trabalho, porque o modo de especificação dá medida e cor exatas que um PNG achata. Exportar só se o link sair do ar.

**D17 · CNPJ alfanumérico** · 2026-09-09
O schema da F1 e o validador da F2 assumiam CNPJ só numérico. Desde a IN RFB 2.229/2024 o CNPJ tem 12 caracteres `[A-Z0-9]` seguidos de 2 dígitos verificadores.
→ `V4__cnpj_alfanumerico.sql` troca as duas constraints antigas por uma que expressa formato e comprimento juntos, por tipo de pessoa. `Documentos.normalizarIdentificacao` substitui `somenteDigitos` no campo de identificação — este último **destruía** CNPJ alfanumérico sem avisar (`12ABC34501DE35` virava `123450135`). A aritmética do DV não mudou: valor do caractere é ASCII−48, e CNPJ numérico segue válido como caso particular. Consequência no front: **a máscara de CNPJ tem que aceitar letras** e forçar maiúsculas.

**D18 · Cartório precisa emitir ao menos um documento** · 2026-09-09
`documentoIds` era `@NotNull`, que aceita conjunto vazio.
→ `@NotEmpty`. O enunciado diz "um cartório pode emitir **uma ou mais** certidões", e cartório sem documento não pode ser usado em agendamento nenhum. Vale para a API e para as duas telas.

**D19 · Validação mora no DTO, nunca no form** · 2026-09-09
`CartorioForm` nasceu duplicando as constraints de `CartorioRequest`, e as mensagens divergiram no mesmo dia.
→ Form sem anotação. O controller valida o request convertido com o `Validator` e devolve cada violação ao campo homônimo do form. Uma fonte de regra para a API e para o Thymeleaf. Toda constraint carrega `message` própria: a padrão do Bean Validation imprime a regex na cara do usuário.

**D20 · Combos com bloco "Dados do cartório" somente leitura** · 2026-09-09
A diretriz se contradiz: pede combo-box com preenchimento condicional **e** fidelidade ao layout, mas o formulário do XD digita nome do documento e endereço do cartório à mão (faz sentido no desafio de front isolado, que não tem backend).
→ Documento e cartório viram **combos**; o bloco "Dados do cartório" fica exatamente onde está no XD, preenchido automaticamente e **somente leitura**. Cumpre "preenchimento condicional" e "não exibir dados desatualizados" sem desmontar a tela. **ViaCEP migra para o cadastro de cartório**, que é onde um cartório nasce — continua sendo requisito atendido, em lugar mais defensável.

**D21 · React Compiler ligado** · 2026-09-09
A diretriz exige Context API "apesar de não ser o mais performático". O React Compiler ficou estável no Next 16 e memoiza automaticamente.
→ `reactCompiler: true`. Ataca a fraqueza reconhecida sem uma linha de código, e vale uma menção no README.

**D22 · Roxo do header é aproximado, e isso está documentado** · 2026-09-09
A paleta do XD não tem roxo: o header é um bitmap de 1366×56, então as faixas são arte, não token.
→ Trio aproximado da arte em `globals.css`, com o desvio registrado em `Contexto/Layout.md`. Se a fidelidade incomodar na F8, o caminho exato é exportar o PNG do header.

**D23 · Lombok e MapStruct, com `@Data` proibido em entidade** · 2026-09-09
Pedido do Victor por práticas atuais.
→ Entidades usam `@Getter @Setter @NoArgsConstructor @AllArgsConstructor`; services e controllers usam `@RequiredArgsConstructor` e `@Slf4j`; mappers viram MapStruct. **Proibidos em entidade:** `@Data` e `@EqualsAndHashCode` (comparam associações lazy → `LazyInitializationException` e `Set` quebrado), `@ToString` (percorre lazy ao logar) e `@Builder` (reabre a escrita de `pedido.numero`, gerado pelo banco). O `equals` por id continua escrito à mão. DTOs continuam `record` — Lombok neles é retrocesso. Virtual threads ligadas (`spring.threads.virtual.enabled`).

**D24 · Código em inglês, banco e interface em pt-BR** · 2026-09-09
Pedido do Victor. Glossário aprovado: `Cartorio`→`NotaryOffice`, `Documento`→**`DocumentType`**, `Pedido`→`Order`, `Agendamento`→**`DocumentRequest`**, CPF/CNPJ→`taxId`, nome/razão social→`legalName`, tipo de pessoa→`PersonType` (`INDIVIDUAL`/`COMPANY`), status→`PENDING`/`IN_PROGRESS`/`COMPLETED`/`CANCELLED`.
→ Duas traduções **não** são literais, de propósito: `DocumentType` porque a entidade é o *tipo* de certidão que um cartório emite, não um documento emitido; `DocumentRequest` porque "agendamento" nunca descreveu o que a tabela guarda — não existe data agendada.
→ **Rotas REST traduzem junto** (`/notary-offices`, `/document-types`, `/orders`, `/document-requests`): metade do contrato em cada idioma seria pior que qualquer extremo.
→ **Não traduzem**: texto de interface, mensagens de validação (chegam ao usuário), seed, migrations e o vault.
→ **Preço**: com campo em inglês e coluna em pt-BR, toda propriedade passa a exigir `@Column(name=...)` e cada entidade um `@Table(name=...)`. Ruído novo, consequência da escolha — registrar no README.

**D25 · Pacote Java de uma palavra, no plural** · 2026-09-09
Primeiro tentei `notaryoffice` (convenção literal, ilegível) e depois `notaryOffice` (legível, mas desvia do padrão Java, que manda tudo minúsculo sem separador).
→ `offices`, `documents`, `requests`, `orders`. Uma palavra, plural, minúscula: legível **e** dentro da convenção. A precisão fica no nome da classe — `com.docket.offices.NotaryOffice`. No frontend a questão não existe: camelCase em pasta é normal em JS (`components/notaryOffices/`).

**D26 · Domínio em português, convenção em inglês** · 2026-09-09
Revisão de D24 pelo Victor logo após a F8. Traduzir o domínio inteiro apagou o vocabulário do negócio — "cartório" e "certidão" são conceitos jurídicos brasileiros sem equivalente exato, e `DocumentType` não diz o que `Documento` dizia para quem conhece o domínio.
→ **Português no que o negócio nomeia**: entidades, campos, valores de enum, rotas, códigos de erro, pacotes. **Inglês no que o código nomeia**: verbos (`list`, `findById`, `create`, `update`, `delete`), preposições (`from`, `to`), sufixos estruturais (`Service`, `Repository`, `Mapper`, `Request`, `Response`) e termos técnicos (`Page`, `Client`, `Handler`).
→ Na prática: `CartorioService.list()`, `CartorioMapper.toResponse()`, `useCepMask`, `lookupCep`.
→ `V5__enums_em_ingles.sql` **apagado** em vez de revertido por um V6: nada foi liberado, então o schema volta a ser exatamente V1–V4, sem dívida de migration.
