package br.com.ampere.dto;

import br.com.ampere.domain.FindingResolution;
import jakarta.validation.constraints.NotNull;

public record FindingResolutionRequest(
    @NotNull(message = "A resolução é obrigatória.") FindingResolution resolution) {}
