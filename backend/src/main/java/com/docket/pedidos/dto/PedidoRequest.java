package com.docket.pedidos.dto;

import com.docket.pedidos.StatusPedido;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PedidoRequest(
        @NotBlank(message = "Informe o lead")
        @Size(max = 200, message = "Máximo de 200 caracteres")
        String lead,

        String observacao,

        @NotBlank(message = "Informe quem está criando a ordem")
        @Size(max = 150, message = "Máximo de 150 caracteres")
        String criadoPor,

        StatusPedido status) {}
