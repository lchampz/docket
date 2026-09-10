package com.docket.pedidos;

import com.docket.agendamentos.AgendamentoRepository;
import com.docket.pedidos.dto.PedidoRequest;
import com.docket.pedidos.dto.PedidoResponse;
import com.docket.shared.error.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final PedidoMapper pedidoMapper;

    @Transactional(readOnly = true)
    public Page<PedidoResponse> list(StatusPedido status, Pageable pageable) {
        Specification<Pedido> spec = (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
        Page<Pedido> page = pedidoRepository.findAll(spec, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PedidoResponse findById(Long id) {
        return toResponse(findEntity(id));
    }

    public PedidoResponse create(PedidoRequest request) {
        Pedido pedido = new Pedido();
        applyData(pedido, request);
        pedido = pedidoRepository.saveAndFlush(pedido);
        return toResponse(reload(pedido.getId()));
    }

    public PedidoResponse update(Long id, PedidoRequest request) {
        Pedido pedido = findEntity(id);
        applyData(pedido, request);
        return toResponse(pedidoRepository.save(pedido));
    }

    public void delete(Long id) {
        findEntity(id);
        pedidoRepository.deleteById(id);
    }

    public Pedido findEntity(Long id) {
        return pedidoRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem", id));
    }

    private Pedido reload(Long id) {
        return pedidoRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem", id));
    }

    private void applyData(Pedido pedido, PedidoRequest request) {
        pedido.setLead(request.lead());
        pedido.setObservacao(request.observacao());
        pedido.setCriadoPor(request.criadoPor());
        pedido.setStatus(request.status() != null ? request.status() : StatusPedido.EM_ANDAMENTO);
    }

    private PedidoResponse toResponse(Pedido pedido) {
        long totalAgendamentos = agendamentoRepository.countByPedidoId(pedido.getId());
        return pedidoMapper.toResponse(pedido, totalAgendamentos);
    }
}
