package com.docket.cartorios;

import com.docket.documentos.dto.DocumentoResponse;
import com.docket.cartorios.dto.CartorioRequest;
import com.docket.cartorios.dto.CartorioResponse;
import com.docket.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
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
@RequestMapping("/api/v1/cartorios")
@Validated
@Tag(name = "Cartórios", description = "CRUD de cartórios e documentos emitidos")
@RequiredArgsConstructor
public class CartorioController {

    private final CartorioService cartorioService;

    @GetMapping
    @Operation(summary = "Listar cartórios")
    public PageResponse<CartorioResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String nome) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome"));
        return PageResponse.from(cartorioService.list(nome, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar cartório por ID")
    public CartorioResponse findById(@PathVariable Long id) {
        return cartorioService.findById(id);
    }

    @GetMapping("/{id}/documentos")
    @Operation(summary = "Listar documentos emitidos pelo cartório")
    public List<DocumentoResponse> listDocumentos(@PathVariable Long id) {
        return cartorioService.listDocumentos(id);
    }

    @PostMapping
    @Operation(summary = "Criar cartório")
    public ResponseEntity<CartorioResponse> create(@Valid @RequestBody CartorioRequest request) {
        CartorioResponse response = cartorioService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cartório")
    public CartorioResponse update(@PathVariable Long id, @Valid @RequestBody CartorioRequest request) {
        return cartorioService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir cartório")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cartorioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
