package com.docket.agendamentos.dto;

import com.docket.agendamentos.TipoPessoa;
import com.docket.agendamentos.validation.IdentificacaoCoerente;
import com.docket.agendamentos.validation.PossuiIdentificacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@IdentificacaoCoerente
public record AgendamentoRequest(
        @NotNull Long cartorioId,
        @NotNull Long documentoId,
        @NotNull TipoPessoa tipoPessoa,
        @NotBlank @Size(max = 200) String nomeRazaoSocial,
        @NotBlank String documentoIdentificacao,
        @Past LocalDate dataNascimento)
        implements PossuiIdentificacao {}
