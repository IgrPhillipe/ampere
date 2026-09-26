package br.com.ampere.dto;

import br.com.ampere.domain.NormativeTableRow;
import java.math.BigDecimal;

public record NormativeTableRowResponse(
    String key,
    BigDecimal lowerBound,
    BigDecimal upperBound,
    BigDecimal value,
    BigDecimal secondValue,
    BigDecimal thirdValue,
    String label) {

  public static NormativeTableRowResponse from(NormativeTableRow row) {
    return new NormativeTableRowResponse(
        row.getRowKey(),
        row.getLowerBound(),
        row.getUpperBound(),
        row.getPrimaryValue(),
        row.getSecondaryValue(),
        row.getTertiaryValue(),
        row.getLabel());
  }
}
