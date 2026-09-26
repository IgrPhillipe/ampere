package br.com.ampere.dto;

import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.LoadUsage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

/**
 * A consumer unit group. {@code kind} says which of the other fields are read.
 *
 * <p>Only the shape of the data is validated here. Normative data left empty is accepted and comes
 * back as a validation issue, so the designer can save a group and complete it later.
 */
public record ConsumerUnitGroupRequest(
    @NotNull(message = "O tipo do grupo é obrigatório.") GroupKind kind,
    @NotBlank(message = "O nome do grupo é obrigatório.")
        @Size(max = 120, message = "O nome do grupo deve ter no máximo {max} caracteres.")
        String name,
    @NotNull(message = "A quantidade é obrigatória.")
        @Min(value = 1, message = "A quantidade deve ser no mínimo {value}.")
        @Max(value = 10000, message = "A quantidade deve ser no máximo {value}.")
        Integer quantity,
    @Positive(message = "A área útil deve ser maior que zero.") BigDecimal usefulArea,
    @Min(value = 0, message = "O número de quartos não pode ser negativo.")
        @Max(value = 50, message = "O número de quartos deve ser no máximo {value}.")
        Integer bedrooms,
    @Positive(message = "A carga por unidade deve ser maior que zero.") BigDecimal unitLoadKw,
    Boolean compactUnit,
    LoadUsage usage,
    @Size(max = 100, message = "Informe no máximo {max} cargas por grupo.")
        List<@Valid LoadItemRequest> items,
    @Positive(message = "A potência por ponto deve ser maior que zero.") BigDecimal powerPerPointKw,
    Boolean incorporatedInVehicle,
    Boolean loadManagement,
    EvStationType stationType) {}
