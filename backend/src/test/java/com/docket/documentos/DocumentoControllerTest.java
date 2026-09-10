package com.docket.documentos;

import com.docket.documentos.dto.DocumentoResponse;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import com.docket.shared.error.ErrorHandler;
import com.docket.shared.error.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocumentoController.class)
@Import(ErrorHandler.class)
class DocumentoControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean DocumentoService documentoService;

    @Test
    @DisplayName("POST com corpo vazio devolve 400 VALIDACAO")
    void postCorpoVazio() throws Exception {
        mockMvc.perform(post("/api/v1/documentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors").isNotEmpty());
    }

    @Test
    @DisplayName("GET lista devolve envelope paginado")
    void getLista() throws Exception {
        var doc = new DocumentoResponse(1L, "Certidão", Instant.parse("2024-01-01T00:00:00Z"));
        var page = new PageImpl<>(List.of(doc), PageRequest.of(0, 10), 1);
        when(documentoService.list(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/documentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("ResourceNotFoundException vira 404 NAO_ENCONTRADO")
    void notFound() throws Exception {
        when(documentoService.findById(99L)).thenThrow(new ResourceNotFoundException("Documento", 99L));

        mockMvc.perform(get("/api/v1/documentos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("NAO_ENCONTRADO"));
    }

    @Test
    @DisplayName("ConflictException vira 409 com código correspondente")
    void conflict() throws Exception {
        when(documentoService.create(any()))
                .thenThrow(new ConflictException(ErrorCode.NOME_DUPLICADO, "Já existe um documento com esse nome."));

        mockMvc.perform(post("/api/v1/documentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Certidão\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("NOME_DUPLICADO"));
    }
}
