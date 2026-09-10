package com.docket.agendamentos.dto;

import com.docket.agendamentos.StatusAgendamento;
import com.docket.agendamentos.TipoPessoa;
import java.time.Instant;
import java.time.LocalDate;

public record AgendamentoResponse(
        Long id,
        String documentoNome,
        TipoPessoa tipoPessoa,
        String nomeRazaoSocial,
        String documentoIdentificacao,
        LocalDate dataNascimento,
        String cartorioNome,
        String cep,
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        StatusAgendamento status,
        Instant createdAt) {}
