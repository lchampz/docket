package com.docket.agendamentos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    boolean existsByCartorioId(Long cartorioId);

    boolean existsByDocumentoId(Long documentoId);

    long countByPedidoId(Long pedidoId);

    @EntityGraph(attributePaths = {"cartorio", "documento"})
    Page<Agendamento> findByPedidoId(Long pedidoId, Pageable pageable);
}
