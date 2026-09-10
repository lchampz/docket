package com.docket.agendamentos;

import com.docket.agendamentos.dto.AgendamentoRequest;
import com.docket.agendamentos.dto.AgendamentoResponse;
import com.docket.agendamentos.dto.UpdateStatusRequest;
import com.docket.cartorios.Cartorio;
import com.docket.cartorios.CartorioRepository;
import com.docket.documentos.Documento;
import com.docket.documentos.DocumentoRepository;
import com.docket.pedidos.Pedido;
import com.docket.pedidos.PedidoService;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ErrorCode;
import com.docket.shared.error.ResourceNotFoundException;
import com.docket.shared.validation.Documentos;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final CartorioRepository cartorioRepository;
    private final DocumentoRepository documentoRepository;
    private final PedidoService pedidoService;
    private final AgendamentoMapper agendamentoMapper;

    @Transactional(readOnly = true)
    public Page<AgendamentoResponse> listByPedido(Long pedidoId, Pageable pageable) {
        pedidoService.findEntity(pedidoId);
        return agendamentoRepository
                .findByPedidoId(pedidoId, pageable)
                .map(agendamentoMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AgendamentoResponse findById(Long id) {
        return agendamentoMapper.toResponse(findEntityWithRelations(id));
    }

    public AgendamentoResponse create(Long pedidoId, AgendamentoRequest request) {
        Pedido pedido = pedidoService.findEntity(pedidoId);

        Cartorio cartorio = cartorioRepository
                .findById(request.cartorioId())
                .orElseThrow(() -> new ResourceNotFoundException("Cartório", request.cartorioId()));

        Documento documento = documentoRepository
                .findById(request.documentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Documento", request.documentoId()));

        if (!cartorioRepository.existsByIdAndDocumentos_Id(
                request.cartorioId(), request.documentoId())) {
            throw new ConflictException(
                    ErrorCode.PAR_CARTORIO_DOCUMENTO_INVALIDO,
                    "O cartório informado não emite esse documento.");
        }

        Agendamento agendamento = new Agendamento();
        agendamento.setPedido(pedido);
        agendamento.setCartorio(cartorio);
        agendamento.setDocumento(documento);
        agendamento.setTipoPessoa(request.tipoPessoa());
        agendamento.setNomeRazaoSocial(request.nomeRazaoSocial());
        agendamento.setDocumentoIdentificacao(Documentos.normalize(request.documentoIdentificacao()));
        agendamento.setDataNascimento(request.dataNascimento());
        agendamento.setStatus(StatusAgendamento.PENDENTE);

        agendamento = agendamentoRepository.save(agendamento);
        return agendamentoMapper.toResponse(agendamento);
    }

    public AgendamentoResponse updateStatus(Long id, UpdateStatusRequest request) {
        Agendamento agendamento = findEntityWithRelations(id);
        agendamento.setStatus(request.status());
        return agendamentoMapper.toResponse(agendamentoRepository.save(agendamento));
    }

    public void delete(Long id) {
        findEntityWithRelations(id);
        agendamentoRepository.deleteById(id);
    }

    private Agendamento findEntityWithRelations(Long id) {
        Agendamento agendamento = agendamentoRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação", id));
        agendamento.getCartorio().getNome();
        agendamento.getDocumento().getNome();
        return agendamento;
    }
}
