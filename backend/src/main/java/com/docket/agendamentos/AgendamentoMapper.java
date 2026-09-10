package com.docket.agendamentos;

import com.docket.agendamentos.dto.AgendamentoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AgendamentoMapper {

    @Mapping(target = "documentoNome", source = "documento.nome")
    @Mapping(target = "cartorioNome", source = "cartorio.nome")
    @Mapping(target = "cep", source = "cartorio.cep")
    @Mapping(target = "rua", source = "cartorio.rua")
    @Mapping(target = "numero", source = "cartorio.numero")
    @Mapping(target = "complemento", source = "cartorio.complemento")
    @Mapping(target = "bairro", source = "cartorio.bairro")
    @Mapping(target = "cidade", source = "cartorio.cidade")
    @Mapping(target = "uf", source = "cartorio.uf")
    AgendamentoResponse toResponse(Agendamento agendamento);
}
