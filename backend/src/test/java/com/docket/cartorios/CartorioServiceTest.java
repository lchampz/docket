package com.docket.cartorios;

import com.docket.agendamentos.AgendamentoService;
import com.docket.agendamentos.TipoPessoa;
import com.docket.agendamentos.dto.AgendamentoRequest;
import com.docket.cartorios.dto.CartorioRequest;
import com.docket.shared.PostgresIntegrationTest;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import com.docket.shared.error.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CartorioServiceTest extends PostgresIntegrationTest {

    private static final long PEDIDO = 1L;

    @Autowired CartorioService cartorioService;
    @Autowired AgendamentoService agendamentoService;

    private CartorioRequest cartorioNovo(Set<Long> documentoIds) {
        return new CartorioRequest(
                "Cartório Teste " + System.nanoTime(),
                "01310100",
                "Av. Paulista",
                "1000",
                null,
                "Bela Vista",
                "São Paulo",
                "SP",
                documentoIds);
    }

    @Test
    @DisplayName("documentoIds com id inexistente lança ResourceNotFoundException")
    void documentoIdInexistente() {
        assertThatThrownBy(() -> cartorioService.create(cartorioNovo(Set.of(99999L))))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("listDocumentos(4) devolve Escritura Pública e Procuração")
    void listDocumentosCartorio4() {
        var documentos = cartorioService.listDocumentos(4L);
        assertThat(documentos).extracting("nome").containsExactlyInAnyOrder("Escritura Pública", "Procuração");
    }

    @Test
    @DisplayName("excluir cartório sem agendamento funciona")
    void excluirCartorioSemAgendamento() {
        var criado = cartorioService.create(cartorioNovo(Set.of(5L, 6L)));
        cartorioService.delete(criado.id());
        assertThatThrownBy(() -> cartorioService.findById(criado.id()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("excluir cartório com agendamento lança RECURSO_EM_USO")
    void excluirCartorioComAgendamento() {
        var cartorio = cartorioService.create(cartorioNovo(Set.of(5L)));
        var agendamento = agendamentoService.create(
                PEDIDO,
                new AgendamentoRequest(
                        cartorio.id(),
                        5L,
                        TipoPessoa.FISICA,
                        "Fulano",
                        "11144477735",
                        LocalDate.of(1990, 1, 1)));
        try {
            assertThatThrownBy(() -> cartorioService.delete(cartorio.id()))
                    .isInstanceOf(ConflictException.class)
                    .extracting("code")
                    .isEqualTo(ErrorCode.RECURSO_EM_USO);
        } finally {
            agendamentoService.delete(agendamento.id());
            cartorioService.delete(cartorio.id());
        }
    }
}
