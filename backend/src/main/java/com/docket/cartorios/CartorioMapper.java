package com.docket.cartorios;

import com.docket.documentos.DocumentoMapper;
import com.docket.cartorios.dto.CartorioResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = DocumentoMapper.class)
public interface CartorioMapper {

    @Mapping(target = "totalDocumentos", expression = "java(cartorio.getDocumentos().size())")
    CartorioResponse toResponse(Cartorio cartorio);
}
