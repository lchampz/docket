package com.docket.documentos;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    boolean existsByNomeIgnoreCase(String nome);

    Optional<Documento> findByNomeIgnoreCase(String nome);
}
