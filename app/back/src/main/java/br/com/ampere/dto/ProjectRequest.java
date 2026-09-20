package br.com.ampere.dto;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.SupplyVoltage;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** The eight fields of US02. Protocol, status and standards belong to the system. */
public record ProjectRequest(
    @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo {max} caracteres.")
        String name,
    @NotBlank(message = "O endereço é obrigatório.")
        @Size(max = 200, message = "O endereço deve ter no máximo {max} caracteres.")
        String address,
    @NotBlank(message = "O município é obrigatório.")
        @Size(max = 100, message = "O município deve ter no máximo {max} caracteres.")
        String municipality,
    @NotNull(message = "O tipo de edificação é obrigatório.") BuildingCategory buildingType,
    @NotNull(message = "O número de pavimentos é obrigatório.")
        @Min(value = 1, message = "O número de pavimentos deve ser no mínimo {value}.")
        @Max(value = 200, message = "O número de pavimentos deve ser no máximo {value}.")
        Integer floors,
    @NotNull(message = "A tensão de fornecimento é obrigatória.") SupplyVoltage voltage,
    @NotNull(message = "O tipo de ligação é obrigatório.") ConnectionType connectionType,
    @NotNull(message = "O padrão de entrada é obrigatório.") EntranceStandard entranceStandard) {}
