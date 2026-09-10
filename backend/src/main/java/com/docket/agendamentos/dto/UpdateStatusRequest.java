package com.docket.agendamentos.dto;

import com.docket.agendamentos.StatusAgendamento;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull StatusAgendamento status) {}
