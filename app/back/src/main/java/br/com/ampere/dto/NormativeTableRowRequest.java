package br.com.ampere.dto;

import br.com.ampere.domain.NormativeTableRow;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record NormativeTableRowRequest(
    @Size(max = 60, message = "A chave deve ter no máximo {max} caracteres.") String key,
    @PositiveOrZero(message = "O início da faixa não pode ser negativo.") BigDecimal lowerBound,
    @PositiveOrZero(message = "O fim da faixa não pode ser negativo.") BigDecimal upperBound,
    @NotNull(message = "O valor da linha é obrigatório.")
        @PositiveOrZero(message = "O valor não pode ser negativo.")
        BigDecimal value,
    @PositiveOrZero(message = "O segundo valor não pode ser negativo.") BigDecimal secondValue,
    @PositiveOrZero(message = "O terceiro valor não pode ser negativo.") BigDecimal thirdValue,
    @Size(max = 120, message = "O rótulo deve ter no máximo {max} caracteres.") String label) {

  public NormativeTableRow toRow() {
    return new NormativeTableRow(
        blankToNull(key),
        lowerBound,
        upperBound,
        value,
        secondValue,
        thirdValue,
        blankToNull(label));
  }

  private static String blankToNull(String text) {
    return text == null || text.isBlank() ? null : text.trim();
  }
}
