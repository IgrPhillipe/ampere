package br.com.ampere.dto;

import jakarta.validation.constraints.NotNull;

/** The version the verifier read, so a change made after it is not approved unseen. */
public record NormativeTablePublicationRequest(
    @NotNull(message = "A versão conferida é obrigatória.") Long version) {}
