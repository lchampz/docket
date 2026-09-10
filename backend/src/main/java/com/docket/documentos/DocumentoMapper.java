package com.docket.documentos;

import com.docket.documentos.dto.DocumentoResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DocumentoMapper {

    DocumentoResponse toResponse(Documento documento);

    List<DocumentoResponse> toResponse(List<Documento> documentos);
}
