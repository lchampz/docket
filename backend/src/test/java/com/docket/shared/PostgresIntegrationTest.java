package com.docket.shared;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base dos testes de integração.
 *
 * <p>Sobe um Postgres real, não H2: as migrations usam índice de expressão
 * (`lower(nome)`), `CHECK` com regex e sequence — coisas que um banco em memória
 * finge suportar e depois diverge. Testar contra outro banco daria confiança
 * falsa justamente nas regras que mais importam.
 *
 * <p>O container é <strong>estático</strong> de propósito: sobe uma vez para
 * toda a suíte, em vez de por classe.
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
public abstract class PostgresIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("docket")
                    .withUsername("docket")
                    .withPassword("docket");

    static {
        POSTGRES.start();
        System.setProperty("spring.datasource.url", POSTGRES.getJdbcUrl());
        System.setProperty("spring.datasource.username", POSTGRES.getUsername());
        System.setProperty("spring.datasource.password", POSTGRES.getPassword());
    }
}
