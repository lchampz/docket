package com.docket.cartorios;

import com.docket.cartorios.dto.CartorioResponse;
import com.docket.shared.error.ErrorHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CartorioController.class)
@Import(ErrorHandler.class)
class CartorioControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean CartorioService cartorioService;

    @Test
    @DisplayName("POST válido devolve 201 com Location")
    void postValido() throws Exception {
        var response = new CartorioResponse(
                42L,
                "Cartório Novo",
                "01310100",
                "Av. Paulista",
                "1000",
                null,
                "Bela Vista",
                "São Paulo",
                "SP",
                List.of(),
                1,
                Instant.parse("2024-01-01T00:00:00Z"));
        when(cartorioService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/cartorios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Cartório Novo",
                                  "cep": "01310100",
                                  "rua": "Av. Paulista",
                                  "numero": "1000",
                                  "cidade": "São Paulo",
                                  "uf": "SP",
                                  "documentoIds": [1]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/v1/cartorios/42"));
    }
}
