package com.docket.documentos.dto;

import java.time.Instant;

public record DocumentoResponse(Long id, String nome, Instant createdAt) {}
