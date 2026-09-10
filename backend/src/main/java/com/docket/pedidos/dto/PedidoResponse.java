package com.docket.pedidos.dto;

import com.docket.pedidos.StatusPedido;
import java.time.Instant;

public record PedidoResponse(
        Long id,
        Integer numero,
        String lead,
        String observacao,
        StatusPedido status,
        String criadoPor,
        Instant createdAt,
        long totalAgendamentos) {}
