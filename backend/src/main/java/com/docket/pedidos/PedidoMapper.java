package com.docket.pedidos;

import com.docket.pedidos.dto.PedidoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PedidoMapper {

    @Mapping(target = "totalAgendamentos", source = "totalAgendamentos")
    PedidoResponse toResponse(Pedido pedido, long totalAgendamentos);
}
