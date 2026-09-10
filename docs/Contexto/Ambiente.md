# Ambiente

## Requisitos para executar

| | Versão | Necessário para |
|---|---|---|
| Docker + Compose v2 | 20.10+ / v2 | **É só isso.** Subir o projeto inteiro |

Nada mais precisa estar instalado na máquina. `docker compose up` compila backend e frontend em container.

## Requisitos para desenvolver fora do Docker

| | Versão | Nota |
|---|---|---|
| JDK | **21** | A diretriz fixa a versão |
| Maven | 3.9+ | |
| Node | 20+ | |
| Postgres | 16 | Ou usar só o container do banco: `docker compose up db` |

## Cuidado com a versão do JDK

Se o JDK do `PATH` for mais novo que 21, `mvn` local compila com ele e aceita código que o build em container recusa. Duas defesas:

1. `<release>21</release>` no compiler plugin — a incompatibilidade aparece já no build local.
2. Fixar a versão no shell:

```bash
sdk install java 21.0.5-tem
sdk use java 21.0.5-tem
```

Na dúvida sobre divergência entre local e container, o container é a verdade — é ele que o avaliador vai rodar.
