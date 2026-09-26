package br.com.ampere.dto;

import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.PowerUnit;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record LoadItemRequest(
    @NotNull(message = "A parcela da carga é obrigatória.") LoadCategory category,
    @NotBlank(message = "A descrição da carga é obrigatória.")
        @Size(max = 120, message = "A descrição deve ter no máximo {max} caracteres.")
        String description,
    @NotNull(message = "A quantidade da carga é obrigatória.")
        @Min(value = 1, message = "A quantidade da carga deve ser no mínimo {value}.")
        @Max(value = 10000, message = "A quantidade da carga deve ser no máximo {value}.")
        Integer quantity,
    @Positive(message = "A potência deve ser maior que zero.") BigDecimal power,
    @NotNull(message = "A unidade da potência é obrigatória.") PowerUnit powerUnit,
    LampTechnology lampTechnology,
    Boolean simultaneousStart) {

  public LoadItem toLoadItem() {
    return new LoadItem(
        category, description, quantity, power, powerUnit, lampTechnology, simultaneousStart);
  }
}
