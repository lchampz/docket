package com.docket.agendamentos.validation;

import com.docket.agendamentos.TipoPessoa;

/**
 * Contrato mínimo que um DTO deve expor para ser validado por
 * {@link IdentificacaoCoerente}. Interface em vez de reflexão: o compilador
 * garante que o DTO tem os dois campos.
 */
public interface PossuiIdentificacao {

    TipoPessoa tipoPessoa();

    String documentoIdentificacao();
}
