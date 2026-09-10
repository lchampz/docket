package com.docket.agendamentos;

import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import com.docket.shared.error.ErrorHandler;
import com.docket.shared.error.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AgendamentoController.class)
@Import(ErrorHandler.class)
class AgendamentoControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean AgendamentoService agendamentoService;

    @Test
    @DisplayName("DELETE devolve 204")
    void deleteDevolve204() throws Exception {
        mockMvc.perform(delete("/api/v1/agendamentos/7")).andExpect(status().isNoContent());

        verify(agendamentoService).delete(7L);
    }

    @Test
    @DisplayName("ResourceNotFoundException vira 404 NAO_ENCONTRADO")
    void notFound() throws Exception {
        doThrow(new ResourceNotFoundException("Agendamento", 99L)).when(agendamentoService).findById(99L);

        mockMvc.perform(get("/api/v1/agendamentos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("NAO_ENCONTRADO"));
    }

    @Test
    @DisplayName("ConflictException vira 409 com código correspondente")
    void conflict() throws Exception {
        doThrow(new ConflictException(ErrorCode.RECURSO_EM_USO, "Em uso"))
                .when(agendamentoService)
                .delete(5L);

        mockMvc.perform(delete("/api/v1/agendamentos/5"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("RECURSO_EM_USO"));
    }
}
