package com.docket.documentos;

import com.docket.documentos.dto.DocumentoRequest;
import com.docket.documentos.dto.DocumentoResponse;
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
@RequestMapping("/api/v1/documentos")
@Validated
@Tag(name = "Documentos", description = "CRUD de tipos de documento")
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoService documentoService;

    @GetMapping
    @Operation(summary = "Listar documentos")
    public PageResponse<DocumentoResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome"));
        return PageResponse.from(documentoService.list(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar documento por ID")
    public DocumentoResponse findById(@PathVariable Long id) {
        return documentoService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Criar documento")
    public ResponseEntity<DocumentoResponse> create(@Valid @RequestBody DocumentoRequest request) {
        DocumentoResponse response = documentoService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar documento")
    public DocumentoResponse update(@PathVariable Long id, @Valid @RequestBody DocumentoRequest request) {
        return documentoService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir documento")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        documentoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
