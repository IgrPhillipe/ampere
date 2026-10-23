package br.com.ampere.dto;

import jakarta.validation.constraints.Size;

public record SubmissionRequest(
    @Size(max = 2000, message = "O resumo das alterações deve ter no máximo {max} caracteres.")
        String changeSummary) {}
