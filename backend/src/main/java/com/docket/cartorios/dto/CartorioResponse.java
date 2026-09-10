package com.docket.cartorios.dto;

import com.docket.documentos.dto.DocumentoResponse;
import java.time.Instant;
import java.util.List;

public record CartorioResponse(
        Long id,
        String nome,
        String cep,
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        List<DocumentoResponse> documentos,
        int totalDocumentos,
        Instant createdAt) {}
