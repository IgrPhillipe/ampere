package br.com.ampere.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateReviewerMunicipalitiesRequest(
    @NotNull(message = "Lista de municípios é obrigatória.")
    List<@Valid MunicipalityAssignmentDto> municipalities) {}
