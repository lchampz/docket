package com.docket.documentos;

import com.docket.agendamentos.AgendamentoRepository;
import com.docket.documentos.dto.DocumentoRequest;
import com.docket.documentos.dto.DocumentoResponse;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import com.docket.shared.error.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final DocumentoMapper documentoMapper;

    @Transactional(readOnly = true)
    public Page<DocumentoResponse> list(Pageable pageable) {
        return documentoRepository.findAll(pageable).map(documentoMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DocumentoResponse findById(Long id) {
        return documentoMapper.toResponse(findEntity(id));
    }

    public DocumentoResponse create(DocumentoRequest request) {
        validateUniqueName(request.nome(), null);
        Documento documento = new Documento();
        documento.setNome(request.nome());
        return documentoMapper.toResponse(documentoRepository.save(documento));
    }

    public DocumentoResponse update(Long id, DocumentoRequest request) {
        Documento documento = findEntity(id);
        validateUniqueName(request.nome(), id);
        documento.setNome(request.nome());
        return documentoMapper.toResponse(documentoRepository.save(documento));
    }

    public void delete(Long id) {
        findEntity(id);
        if (agendamentoRepository.existsByDocumentoId(id)) {
            throw new ConflictException(
                    ErrorCode.RECURSO_EM_USO, "Documento possui registros vinculados e não pode ser excluído.");
        }
        documentoRepository.deleteById(id);
    }

    private Documento findEntity(Long id) {
        return documentoRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento", id));
    }

    private void validateUniqueName(String nome, Long ignoredId) {
        documentoRepository.findByNomeIgnoreCase(nome).ifPresent(existing -> {
            if (ignoredId == null || !existing.getId().equals(ignoredId)) {
                throw new ConflictException(ErrorCode.NOME_DUPLICADO, "Já existe um documento com esse nome.");
            }
        });
    }
}
