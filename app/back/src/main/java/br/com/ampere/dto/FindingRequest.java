package br.com.ampere.dto;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FindingRequest(
    @NotNull(message = "A gravidade é obrigatória.") FindingSeverity severity,
    @NotNull(message = "A etapa é obrigatória.") FindingStage stage,
    Long consumerUnitGroupId,
    @Size(max = 100, message = "A parcela deve ter no máximo {max} caracteres.")
        String calculationStepCode,
    DocumentType documentType,
    @NotBlank(message = "A descrição é obrigatória.")
        @Size(max = 2000, message = "A descrição deve ter no máximo {max} caracteres.")
        String description,
    @Size(max = 255, message = "O item da norma deve ter no máximo {max} caracteres.")
        String standardItem) {}
