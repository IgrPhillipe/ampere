package br.com.ampere.dto;

import br.com.ampere.domain.FindingAnswer;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FindingAnswerRequest(
    @NotNull(message = "A situação é obrigatória.") FindingAnswer status,
    @Size(max = 2000, message = "A resposta deve ter no máximo {max} caracteres.")
        String response) {}
