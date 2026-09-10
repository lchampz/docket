package com.docket.documentos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DocumentoRequest(
        @NotBlank(message = "Informe o nome do documento")
        @Size(max = 150, message = "Máximo de 150 caracteres")
        String nome) {}
