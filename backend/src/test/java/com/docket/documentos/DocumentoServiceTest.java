package com.docket.documentos;

import com.docket.documentos.dto.DocumentoRequest;
import com.docket.shared.PostgresIntegrationTest;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DocumentoServiceTest extends PostgresIntegrationTest {

    @Autowired DocumentoService service;

    @Test
    @DisplayName("nome duplicado ignorando caixa lança NOME_DUPLICADO")
    void nomeDuplicadoIgnorandoCaixa() {
        var criado = service.create(new DocumentoRequest("Certidão Teste Dup"));
        try {
            assertThatThrownBy(() -> service.create(new DocumentoRequest("certidão teste dup")))
                    .isInstanceOf(ConflictException.class)
                    .extracting("code")
                    .isEqualTo(ErrorCode.NOME_DUPLICADO);
        } finally {
            service.delete(criado.id());
        }
    }

    @Test
    @DisplayName("atualizar mantendo o próprio nome não conflita")
    void atualizarMantendoProprioNome() {
        var criado = service.create(new DocumentoRequest("Documento Update OK"));
        try {
            var atualizado = service.update(criado.id(), new DocumentoRequest("documento update ok"));
            assertThat(atualizado.nome()).isEqualTo("documento update ok");
        } finally {
            service.delete(criado.id());
        }
    }
}
