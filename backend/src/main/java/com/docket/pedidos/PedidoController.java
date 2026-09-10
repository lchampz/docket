package com.docket.pedidos;

import com.docket.agendamentos.AgendamentoService;
import com.docket.agendamentos.dto.AgendamentoRequest;
import com.docket.agendamentos.dto.AgendamentoResponse;
import com.docket.pedidos.dto.PedidoRequest;
import com.docket.pedidos.dto.PedidoResponse;
import com.docket.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/pedidos")
@Validated
@Tag(name = "Pedidos", description = "CRUD de pedidos e agendamentos vinculados")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;
    private final AgendamentoService agendamentoService;

    @GetMapping
    @Operation(summary = "Listar pedidos")
    public PageResponse<PedidoResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) StatusPedido status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(pedidoService.list(status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar pedido por ID")
    public PedidoResponse findById(@PathVariable Long id) {
        return pedidoService.findById(id);
    }

    @GetMapping("/{id}/agendamentos")
    @Operation(summary = "Listar agendamentos do pedido")
    public PageResponse<AgendamentoResponse> listAgendamentos(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(agendamentoService.listByPedido(id, pageable));
    }

    @PostMapping
    @Operation(summary = "Criar pedido")
    public ResponseEntity<PedidoResponse> create(@Valid @RequestBody PedidoRequest request) {
        PedidoResponse response = pedidoService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @PostMapping("/{id}/agendamentos")
    @Operation(summary = "Criar agendamento no pedido")
    public ResponseEntity<AgendamentoResponse> createAgendamento(
            @PathVariable Long id, @Valid @RequestBody AgendamentoRequest request) {
        AgendamentoResponse response = agendamentoService.create(id, request);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/agendamentos/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar pedido")
    public PedidoResponse update(@PathVariable Long id, @Valid @RequestBody PedidoRequest request) {
        return pedidoService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir pedido")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pedidoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
