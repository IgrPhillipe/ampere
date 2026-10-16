package br.com.ampere.dto;

import br.com.ampere.domain.ReviewDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewDecisionRequest(
    @NotNull(message = "A decisão é obrigatória.") ReviewDecision decision,
    @NotBlank(message = "O parecer é obrigatório.")
        @Size(max = 2000, message = "O parecer deve ter no máximo {max} caracteres.")
        String opinion) {}
