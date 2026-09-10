# Board

| Fase | Spec                   | Estado | Entrega verificável                                                   |
| ---- | ---------------------- | ------ | --------------------------------------------------------------------- |
| 0    | [[F0-Scaffolding]]     | ✅      | `docker compose up` sobe db + backend + front vazios, todos saudáveis |
| 1    | [[F1-Schema]]          | ✅      | 5 tabelas migradas com seed; `\dt` mostra dados                       |
| 2    | [[F2-Backend-CRUD]]    | ✅      | Swagger navegável com os 4 CRUDs, validação e paginação               |
| 3    | [[F3-Thymeleaf]]       | ✅      | `/cartorios` lista, cadastra, edita e exclui                          |
| 4    | [[F4-Front-Base]]      | ✅      | Tokens do XD extraídos, shell da página, cliente HTTP, Context        |
| 5    | [[F5-Front-Cadastros]] | ✅      | CRUD de cartório e documento com ViaCEP, máscaras, paginação, toasts  |
| 6    | [[F6-Front-Pedido]]    | ✅      | Tela do layout inteira, ponta a ponta                                 |
| 7    | [[F7-Modernizacao]]    | ✅      | Lombok, MapStruct e virtual threads, sem mudar contrato               |
| 8    | [[F8-Traducao]]        | ✅      | Código em inglês; banco e interface seguem em pt-BR                   |
| 8.1  | [[F8.1-Convencao-Idioma]] | ✅      | Domínio volta ao pt-BR; convenções de código em inglês                |
| 9    | [[F9-Qualidade]]       | ✅      | Testes verdes, responsivo, semântico                                  |
| 10   | [[F10-Fechamento]]     | ✅      | README testado do zero, fidelidade revisada tela a tela               |

Estados: ⬜ não iniciada · 🟡 em andamento · ✅ fechada

## Regras

- Número é **ordem de execução**, reatribuída quando uma fase nova entra no meio. O que aconteceu de verdade está em `Registro/`, que nunca renumera.
- Uma fase por vez. Fase fechada não reabre — se precisou, virou spec nova.
- Checkbox só marca depois do critério de aceite rodar de verdade.
- Ao fechar, escrever `Registro/F<n>.md`.
- Ordem escolhida para que nenhuma fase de front espere endpoint que ainda não existe.
