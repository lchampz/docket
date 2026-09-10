package com.docket.agendamentos;

import com.docket.agendamentos.dto.AgendamentoRequest;
import com.docket.agendamentos.dto.AgendamentoResponse;
import com.docket.agendamentos.dto.UpdateStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/agendamentos")
@Validated
@Tag(name = "Agendamentos", description = "Consulta, exclusão e atualização de status de agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @GetMapping("/{id}")
    @Operation(summary = "Buscar agendamento por ID")
    public AgendamentoResponse findById(@PathVariable Long id) {
        return agendamentoService.findById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar agendamento",
            description = "Atualiza os dados do agendamento. O status não muda por aqui — use PATCH /{id}/status.")
    public AgendamentoResponse update(
            @PathVariable Long id, @Valid @RequestBody AgendamentoRequest request) {
        return agendamentoService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do agendamento")
    public AgendamentoResponse updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        return agendamentoService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir agendamento")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        agendamentoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
