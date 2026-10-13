package br.com.ampere.dto;

import br.com.ampere.domain.ReviewDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewDecisionRequest(
    @NotNull ReviewDecision decision, @NotBlank @Size(max = 2000) String opinion) {}
