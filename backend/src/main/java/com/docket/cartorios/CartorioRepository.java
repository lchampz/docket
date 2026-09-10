package com.docket.cartorios;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartorioRepository extends JpaRepository<Cartorio, Long> {

    @EntityGraph(attributePaths = "documentos")
    Page<Cartorio> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "documentos")
    Optional<Cartorio> findById(Long id);

    @EntityGraph(attributePaths = "documentos")
    Page<Cartorio> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    boolean existsByIdAndDocumentos_Id(Long cartorioId, Long documentoId);
}
