# Docket

Sistema de solicitação de documentos a cartórios: cadastra cartórios e os documentos que cada um emite, e registra solicitações dentro de um pedido.

**Java 21 · Spring Boot 3.5 · Thymeleaf · PostgreSQL 16 · Next.js 16 · TypeScript · Tailwind**

---

## Como executar

Só é preciso ter **Docker** instalado. Nada de Java, Node ou Postgres na máquina.

```bash
cp .env.example .env
docker compose up --build
```

A primeira execução compila backend e frontend dentro dos containers e leva alguns minutos. Quando os três serviços ficarem saudáveis:

| | URL |
|---|---|
| **Aplicação (React)** | http://localhost:3000 |
| Cartórios — server-rendered (Thymeleaf) | http://localhost:8080/cartorios |
| API REST | http://localhost:8080/api/v1 |
| Documentação da API (Swagger) | http://localhost:8080/swagger-ui |

O banco sobe com dados de exemplo: 4 cartórios, 6 documentos e 1 pedido **sem solicitações** — a tela abre no estado vazio, e o primeiro registro é criado por você.

Para derrubar tudo e apagar o banco:

```bash
docker compose down -v
```

### Credenciais

Estão em `.env.example`, que você copiou para `.env`. São de desenvolvimento (`docket` / `docket`); em produção viriam do ambiente. Nenhuma senha está no código — o perfil `docker` lê tudo de variável de ambiente.

---

## O que dá para fazer

1. **Cadastrar cartórios** em `/cartorios` — o endereço é preenchido pelo CEP via [ViaCEP](https://viacep.com.br/), e você marca quais documentos aquele cartório emite.
2. **Cadastrar documentos** em `/documentos` — a listagem pagina a cada 10.
3. **Solicitar um documento** na tela inicial: escolhe o cartório, e a lista de documentos passa a mostrar **apenas o que aquele cartório emite**.

O terceiro é o ponto central. Um cartório que não emite certidão de nascimento não oferece essa opção; e se a combinação for forçada pela API, o backend recusa com `409`.

---

## Como rodar os testes

```bash
cd backend  && mvn test    # 39 testes
cd frontend && npm test    # 19 testes
```

Os testes de integração sobem um **PostgreSQL real** via Testcontainers (o Docker precisa estar rodando), não um banco em memória: as migrations usam índice de expressão, `CHECK` com regex e sequence, e um banco em memória divergiria justamente nas regras que mais importam.

---

## Decisões que valem explicação

**Duas interfaces sobre a mesma camada de aplicação.** O desafio de backend pede front server-rendered em Thymeleaf; o de frontend pede React consumindo API REST. As duas existem e compartilham os mesmos `Service` — muda só o controller. Nenhuma regra de negócio está duplicada.

**Existe uma entidade `Pedido` que a especificação não pedia.** O layout inteiro gira em torno de um "Pedido #1" com lead, observação, status e autor. Modelar isso foi a única ampliação deliberada de escopo; sem ela, o cabeçalho da tela seria texto fixo.

**O `Agendamento` tem dois campos a mais** que a modelagem original: `nomeRazaoSocial` e `dataNascimento`. O card do layout exibe os dois.

**CPF e CNPJ são validados por dígito verificador**, não por formato. `111.111.111-11` passa em qualquer regex e não é um CPF. O **CNPJ é alfanumérico** conforme a IN RFB 2.229/2024: 12 caracteres `[A-Z0-9]` mais 2 dígitos verificadores. Consequência prática: remover não-dígitos de um CNPJ o destrói (`12ABC34501DE35` viraria `123450135`), então a desmascaração acontece num ponto só e preserva letras.

**Documento de identificação é gravado sem máscara.** A máscara é responsabilidade da tela; o banco guarda só o conteúdo, com `CHECK` de formato por tipo de pessoa.

**Erros seguem RFC 7807 com um código estável.** O front decide o que fazer a partir do `codigo`, nunca do texto da mensagem. Erros de validação trazem `errors[]` com o campo, e é isso que permite colar a mensagem embaixo do input certo em vez de jogar um alerta genérico.

**Idioma:** substantivo do negócio em português (`Cartorio`, `documentoIdentificacao`, `FISICA`), verbo e estrutura em inglês (`list`, `findById`, `toResponse`, `Service`). "Cartório" e "certidão" são conceitos jurídicos brasileiros — traduzi-los perderia precisão. Interface e mensagens ao usuário, em português.

**A API de certidões citada no enunciado está fora do ar** (`docketdesafiobackend.herokuapp.com`, Heroku desligou o plano gratuito). Os documentos vêm do seed local.

**O `PUT /agendamentos/{id}` existe, mas nenhuma tela usa.** A especificação pede CRUD completo; o layout não tem edição de solicitação. A API cumpre o requisito, a interface segue o desenho.

---

## Estrutura

```
backend/     Java 21 · Spring Boot · camadas por feature
frontend/    Next.js · App Router · Context API
docs/        planejamento, decisões e registro de cada fase
scripts/     utilitários
```

### Backend

```
com.docket.
├── cartorios/     Controller · Service · Repository · Entity · dto · mapper
├── documentos/
├── pedidos/
├── agendamentos/
├── web/           controllers Thymeleaf
└── shared/        tratamento de erro, validação, paginação, config
```

Camadas dentro de fatias verticais. Persistência com Spring Data JPA e **Flyway** — o schema é versionado, `ddl-auto` é `validate`, e a aplicação não sobe se entidade e migration divergirem.

### Frontend

```
app/            rotas
components/ui/  design system
contexts/       estado por provider
lib/api/        única porta para o backend
hooks/          máscaras e comportamento reutilizável
```

Os tokens de cor e tipografia vieram do arquivo do Adobe XD, não de estimativa.

---

## Planejamento

O projeto foi executado em 11 fases, cada uma terminando em algo verificável. O planejamento, as 26 decisões registradas e o diário de cada fase estão em [`docs/`](docs/) — incluindo o que quebrou e o que mudou de rumo no caminho.
