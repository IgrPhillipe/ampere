package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MunicipalityAssignmentDto(
    @NotNull(message = "UF é obrigatória.") BrazilianState state,
    @NotBlank(message = "Município é obrigatório.") String municipality) {}
