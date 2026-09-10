package com.docket.cartorios;

import com.docket.agendamentos.AgendamentoRepository;
import com.docket.documentos.Documento;
import com.docket.documentos.DocumentoMapper;
import com.docket.documentos.DocumentoRepository;
import com.docket.documentos.dto.DocumentoResponse;
import com.docket.cartorios.dto.CartorioRequest;
import com.docket.cartorios.dto.CartorioResponse;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import com.docket.shared.error.ResourceNotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
@RequiredArgsConstructor
public class CartorioService {

    private final CartorioRepository cartorioRepository;
    private final DocumentoRepository documentoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final CartorioMapper cartorioMapper;
    private final DocumentoMapper documentoMapper;

    @Transactional(readOnly = true)
    public Page<CartorioResponse> list(String nome, Pageable pageable) {
        Page<Cartorio> page = StringUtils.hasText(nome)
                ? cartorioRepository.findByNomeContainingIgnoreCase(nome, pageable)
                : cartorioRepository.findAll(pageable);
        return page.map(cartorioMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CartorioResponse findById(Long id) {
        return cartorioMapper.toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listDocumentos(Long cartorioId) {
        Cartorio cartorio = findEntity(cartorioId);
        return documentoMapper.toResponse(List.copyOf(cartorio.getDocumentos()));
    }

    public CartorioResponse create(CartorioRequest request) {
        Cartorio cartorio = new Cartorio();
        applyData(cartorio, request);
        return cartorioMapper.toResponse(cartorioRepository.save(cartorio));
    }

    public CartorioResponse update(Long id, CartorioRequest request) {
        Cartorio cartorio = findEntity(id);
        applyData(cartorio, request);
        return cartorioMapper.toResponse(cartorioRepository.save(cartorio));
    }

    public void delete(Long id) {
        findEntity(id);
        if (agendamentoRepository.existsByCartorioId(id)) {
            throw new ConflictException(
                    ErrorCode.RECURSO_EM_USO, "Cartório possui registros vinculados e não pode ser excluído.");
        }
        cartorioRepository.deleteById(id);
    }

    private Cartorio findEntity(Long id) {
        return cartorioRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cartório", id));
    }

    private void applyData(Cartorio cartorio, CartorioRequest request) {
        cartorio.setNome(request.nome());
        cartorio.setCep(request.cep());
        cartorio.setRua(request.rua());
        cartorio.setNumero(request.numero());
        cartorio.setComplemento(request.complemento());
        cartorio.setBairro(request.bairro());
        cartorio.setCidade(request.cidade());
        cartorio.setUf(request.uf());
        cartorio.setDocumentos(resolveDocumentos(request.documentoIds()));
    }

    private Set<Documento> resolveDocumentos(Set<Long> documentoIds) {
        Set<Documento> documentos = new HashSet<>(documentoRepository.findAllById(documentoIds));
        for (Long documentoId : documentoIds) {
            boolean found = documentos.stream().anyMatch(d -> d.getId().equals(documentoId));
            if (!found) {
                throw new ResourceNotFoundException("Documento", documentoId);
            }
        }
        return documentos;
    }
}
