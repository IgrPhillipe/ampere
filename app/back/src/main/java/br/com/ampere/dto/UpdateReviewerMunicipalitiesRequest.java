package br.com.ampere.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateReviewerMunicipalitiesRequest(
    @NotNull(message = "A lista de municípios é obrigatória.")
        List<@NotNull(message = "Município inválido.") @Valid MunicipalityRequest>
            municipalities) {}
