package com.docket.agendamentos;

import com.docket.agendamentos.dto.AgendamentoRequest;
import com.docket.agendamentos.dto.AgendamentoResponse;
import com.docket.shared.PostgresIntegrationTest;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integração contra Postgres real, exercitando as regras que só existem quando
 * banco e serviço estão juntos.
 *
 * <p>Cada teste que remove o que cria mantém o seed intacto — o próximo teste
 * não pode depender da ordem de execução.
 */
class AgendamentoIntegracaoTest extends PostgresIntegrationTest {

    // IDs do seed. Cartório 1 emite os 6 documentos; o 4 não emite certidão.
    private static final long PEDIDO = 1L;
    private static final long CARTORIO_COMPLETO = 1L;
    private static final long CARTORIO_SEM_CERTIDAO = 4L;
    private static final long CERTIDAO_NASCIMENTO = 1L;
    private static final String CPF = "11144477735";
    private static final String CNPJ_ALFANUMERICO = "12ABC34501DE35";

    @Autowired AgendamentoService service;
    @Autowired AgendamentoRepository repository;
    @Autowired EntityManager entityManager;

    private Statistics estatisticas;

    @BeforeEach
    void limparEstatisticas() {
        estatisticas = entityManager.getEntityManagerFactory()
                .unwrap(SessionFactory.class).getStatistics();
        estatisticas.clear();
    }

    private AgendamentoRequest pedidoDe(long cartorioId, long documentoId, TipoPessoa tipo, String documento) {
        return new AgendamentoRequest(cartorioId, documentoId, tipo, "Fulano de Tal", documento,
                tipo == TipoPessoa.FISICA ? LocalDate.of(1990, 5, 12) : null);
    }

    @Test
    @DisplayName("cartório que não emite o documento é recusado com 409")
    void parInvalidoRecusado() {
        assertThatThrownBy(() -> service.create(PEDIDO,
                pedidoDe(CARTORIO_SEM_CERTIDAO, CERTIDAO_NASCIMENTO, TipoPessoa.FISICA, CPF)))
                .isInstanceOf(ConflictException.class)
                .extracting("code")
                .isEqualTo(ErrorCode.PAR_CARTORIO_DOCUMENTO_INVALIDO);
    }

    @Test
    @DisplayName("agendamento nasce PENDENTE e guarda o documento sem máscara")
    void nascePendenteESemMascara() {
        AgendamentoResponse criado = service.create(PEDIDO,
                new AgendamentoRequest(CARTORIO_COMPLETO, CERTIDAO_NASCIMENTO, TipoPessoa.FISICA,
                        "Ana Souza", "111.444.777-35", LocalDate.of(1990, 5, 12)));
        try {
            assertThat(criado.status()).isEqualTo(StatusAgendamento.PENDENTE);
            assertThat(criado.documentoIdentificacao()).isEqualTo(CPF);
        } finally {
            service.delete(criado.id());
        }
    }

    @Test
    @DisplayName("CNPJ alfanumérico atravessa validação e CHECK do banco")
    void cnpjAlfanumericoAceito() {
        AgendamentoResponse criado = service.create(PEDIDO,
                new AgendamentoRequest(CARTORIO_COMPLETO, 5L, TipoPessoa.JURIDICA,
                        "Acme Ltda", "12.abc.345/01de-35", null));
        try {
            assertThat(criado.documentoIdentificacao()).isEqualTo(CNPJ_ALFANUMERICO);
        } finally {
            service.delete(criado.id());
        }
    }

    /**
     * Trava contra regressão de N+1.
     *
     * <p>A listagem devolve os dados do cartório e do documento achatados. Se o
     * `@EntityGraph` do repository sair, cada linha vira uma consulta a mais e
     * ninguém percebe — a resposta continua correta, só fica lenta. Este teste
     * falha nesse dia.
     */
    @Test
    @DisplayName("listar agendamentos não faz N+1")
    void listagemNaoFazNMaisUm() {
        AgendamentoResponse a = service.create(PEDIDO,
                pedidoDe(CARTORIO_COMPLETO, CERTIDAO_NASCIMENTO, TipoPessoa.FISICA, CPF));
        AgendamentoResponse b = service.create(PEDIDO,
                pedidoDe(2L, 2L, TipoPessoa.FISICA, "52998224725"));
        try {
            entityManager.clear();
            estatisticas.clear();

            var pagina = service.listByPedido(PEDIDO, PageRequest.of(0, 10));
            assertThat(pagina.getContent()).hasSize(2);

            long consultas = estatisticas.getPrepareStatementCount();
            // Uma para a página, no máximo uma para o count da paginação.
            // Dois agendamentos de cartórios distintos: com N+1 seriam 5 ou mais.
            assertThat(consultas)
                    .as("consultas disparadas ao listar 2 agendamentos de cartórios distintos")
                    .isLessThanOrEqualTo(2);
        } finally {
            service.delete(a.id());
            service.delete(b.id());
        }
    }

    @Test
    @DisplayName("update troca cartório e documento, mas não mexe no status")
    void updateNaoMexeNoStatus() {
        AgendamentoResponse criado = service.create(PEDIDO,
                pedidoDe(CARTORIO_COMPLETO, CERTIDAO_NASCIMENTO, TipoPessoa.FISICA, CPF));
        try {
            service.updateStatus(criado.id(), new com.docket.agendamentos.dto.UpdateStatusRequest(
                    StatusAgendamento.EM_ANDAMENTO));

            AgendamentoResponse atualizado = service.update(criado.id(),
                    new AgendamentoRequest(CARTORIO_COMPLETO, 5L, TipoPessoa.JURIDICA,
                            "Acme Ltda", "12.abc.345/01de-35", null));

            assertThat(atualizado.documentoNome()).isEqualTo("Escritura Pública");
            assertThat(atualizado.documentoIdentificacao()).isEqualTo(CNPJ_ALFANUMERICO);
            assertThat(atualizado.status())
                    .as("status é responsabilidade do PATCH, não do PUT")
                    .isEqualTo(StatusAgendamento.EM_ANDAMENTO);
        } finally {
            service.delete(criado.id());
        }
    }

    @Test
    @DisplayName("update com par inválido é recusado igual à criação")
    void updateValidaPar() {
        AgendamentoResponse criado = service.create(PEDIDO,
                pedidoDe(CARTORIO_COMPLETO, CERTIDAO_NASCIMENTO, TipoPessoa.FISICA, CPF));
        try {
            assertThatThrownBy(() -> service.update(criado.id(),
                    pedidoDe(CARTORIO_SEM_CERTIDAO, CERTIDAO_NASCIMENTO, TipoPessoa.FISICA, CPF)))
                    .isInstanceOf(ConflictException.class)
                    .extracting("code")
                    .isEqualTo(ErrorCode.PAR_CARTORIO_DOCUMENTO_INVALIDO);
        } finally {
            service.delete(criado.id());
        }
    }

    @Test
    @DisplayName("excluir devolve a contagem do pedido ao valor do seed")
    void exclusaoDevolveContagem() {
        long antes = repository.countByPedidoId(PEDIDO);
        AgendamentoResponse criado = service.create(PEDIDO,
                pedidoDe(CARTORIO_COMPLETO, CERTIDAO_NASCIMENTO, TipoPessoa.FISICA, CPF));
        assertThat(repository.countByPedidoId(PEDIDO)).isEqualTo(antes + 1);

        service.delete(criado.id());
        assertThat(repository.countByPedidoId(PEDIDO)).isEqualTo(antes);
    }
}
