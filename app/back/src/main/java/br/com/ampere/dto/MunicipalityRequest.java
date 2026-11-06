package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MunicipalityRequest(
    @NotNull(message = "A UF é obrigatória.") BrazilianState state,
    @NotBlank(message = "O município é obrigatório.") String municipality) {}
