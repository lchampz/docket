# F3 · subagent — Thymeleaf

Projeto: `~/Documents/dev/docket/backend`. CRUD de cartórios server-rendered em `/cartorios`, cumprindo o requisito obrigatório do desafio backend.

## Já pronto, use e não reescreva

| | |
|---|---|
| `CartorioService` | `listar(String nome, Pageable)` · `buscarPorId(Long)` · `criar(CartorioRequest)` · `atualizar(Long, CartorioRequest)` · `excluir(Long)` |
| `DocumentoService` | `listar(Pageable)` — para popular o multi-select |
| `static/css/admin.css` | Folha de estilo pronta. **Não escrever CSS novo**, só usar as classes abaixo |
| `shared.error.ConflitoException` / `RecursoNaoEncontradoException` | Lançadas pelos services |

**Nenhuma regra de negócio no pacote `web`.** Se sentir vontade de checar algo antes de chamar o service, pare: a regra já está lá dentro. Esta camada só traduz HTTP↔tela.

## 1 · Formulário bindável — `web/CartorioForm.java`

`CartorioRequest` é record imutável e não serve para bind de formulário com reexibição de erro. Criar uma **classe mutável** `CartorioForm` com os mesmos campos (`nome`, `cep`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `Set<Long> documentoIds`), getters e setters, as mesmas anotações de Bean Validation do record, e:

- `CartorioRequest paraRequest()`
- `static CartorioForm de(CartorioResponse)` — para a tela de edição

## 2 · `web/CartorioWebController.java` — `@Controller @RequestMapping("/cartorios")`

| Método | Rota | Faz |
|---|---|---|
| `GET` | `/cartorios` | Lista paginada. Params `page`, `size` (default 10), `nome` |
| `GET` | `/cartorios/novo` | Form vazio |
| `POST` | `/cartorios` | Cria |
| `GET` | `/cartorios/{id}/editar` | Form preenchido |
| `POST` | `/cartorios/{id}` | Atualiza |
| `POST` | `/cartorios/{id}/excluir` | Exclui |

> **Só `GET` e `POST`.** Navegador não envia `PUT`/`DELETE` em formulário, e o `HiddenHttpMethodFilter` vem desligado por padrão no Spring Boot 3. Rotas explícitas em vez de ligar o filtro.

Regras:
- `@Valid @ModelAttribute("cartorio") CartorioForm` + `BindingResult`. Com erro: **reexibir a mesma view** com o que o usuário digitou, sem redirect
- Sucesso: `redirect:/cartorios` + flash `sucesso` via `RedirectAttributes`
- `@ExceptionHandler(ConflitoException.class)` **no próprio controller**, devolvendo `redirect:/cartorios` com flash `erro` contendo `ex.getMessage()`. O `ManipuladorDeErros` global está restrito a `@RestController` e não pega esta camada — de propósito
- `@ExceptionHandler(RecursoNaoEncontradoException.class)` → view de erro simples, status `404`

## 3 · Templates — `resources/templates/`

`layout.html` com fragments (`cabecalho`, `rodape`), `cartorios/lista.html`, `cartorios/form.html`, `erro.html`.

Todos incluem `<link rel="stylesheet" th:href="@{/css/admin.css}">`.

### Classes disponíveis no CSS

`header.topo` (com `nav` dentro) · `main` · `.cartao` · `.barra` / `.barra .cresce` · `table` com `th`/`td` · `td.acoes` · `form.campos` com `p`, `p.metade`, `p.terco` e `.acoes` · `fieldset` + `legend` + `.opcoes` · `.botao.primario` / `.botao.neutro` / `.botao.perigo` · `.aviso.sucesso` / `.aviso.erro` · `.vazio` · `.paginacao` · `.etiqueta` · `.erro-campo`

### `lista.html`
- `h1` com contagem: `Cartórios <span class="contagem">(N)</span>`
- Busca por nome no `.barra`, botão "Novo cartório" à direita
- Tabela: Nome · Endereço (rua, número, cidade/UF) · CEP · Documentos emitidos (`.etiqueta` por documento) · Ações
- **`th` com `scope="col"`**, e cada `td` com `data-rotulo="…"` — o CSS usa isso para virar cartão no mobile
- Sem resultado → `.vazio` com "Nenhum cartório cadastrado"
- Paginação em `.paginacao` só se `totalPages > 1`, com `aria-current="page"` na atual
- Excluir: `form` `POST` para `/cartorios/{id}/excluir` com `onsubmit="return confirm(...)"`
- Flash `sucesso`/`erro` em `.aviso`

### `form.html`
- Serve criar e editar; muda `th:action` e o título
- `label` com `for`, campo obrigatório marcado com `<span class="obrigatorio">*</span>`
- Erro por campo: `aria-invalid="true"` no input e `<span class="erro-campo">` com a mensagem
- CEP com `inputmode="numeric"`, UF como `select` com as 27 unidades
- Documentos emitidos em `fieldset` + `.opcoes` com checkboxes de `documentoIds`
- Ações: "Salvar" (`.botao.primario`) e "Cancelar" (`.botao.neutro`, link para a lista)

## 4 · Raiz

`GET /` → `redirect:/cartorios`.

---

## Verificação

```bash
cd ~/Documents/dev/docket && docker compose up -d --build
```

- [ ] `/` redireciona para `/cartorios`, que lista os 4 do seed com os documentos que cada um emite
- [ ] "Novo cartório" → salvar válido → volta para a lista com aviso verde, e o registro aparece
- [ ] Submeter o form **vazio** → mesma página, erros por campo, **sem perder o que já estava digitado**
- [ ] CEP `1234` → erro no campo, não `500`
- [ ] Editar carrega os valores atuais, inclusive os checkboxes marcados
- [ ] Excluir cartório do seed sem agendamento → sai da lista, aviso verde
- [ ] Excluir cartório **com** agendamento → volta para a lista com **aviso vermelho** legível em HTML. **Se aparecer JSON na tela, o `@ExceptionHandler` do controller está faltando**
- [ ] `/cartorios/9999/editar` → página de erro 404, não whitelabel
- [ ] Em 375px de largura a tabela vira cartões e nada estoura horizontalmente
- [ ] `grep -rn "Repository\|existsBy" src/main/java/com/docket/web/` → **vazio**

**Limpe o que criar durante os testes** para o seed continuar 4/6/14/1/0.
