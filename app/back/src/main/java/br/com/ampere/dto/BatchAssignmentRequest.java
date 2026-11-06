package br.com.ampere.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BatchAssignmentRequest(
    @NotEmpty(message = "Selecione ao menos um projeto.")
        List<@NotNull(message = "Projeto inválido.") Long> projectIds,
    @NotNull(message = "O analista é obrigatório.") Long reviewerId) {}
