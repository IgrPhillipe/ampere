package br.com.ampere.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BatchAssignmentRequest(
    @NotEmpty(message = "Projetos são obrigatórios.") List<String> projectIds,
    @NotNull(message = "Analista é obrigatório.") String reviewerId) {}
