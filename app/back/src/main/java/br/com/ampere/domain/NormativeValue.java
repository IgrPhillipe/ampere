package br.com.ampere.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** A row found in a published table, together with where it was read. */
public record NormativeValue(NormativeTableRow row, NormativeReference reference) {

  private static final BigDecimal HUNDRED = new BigDecimal("100");

  public BigDecimal value() {
    return row.getPrimaryValue();
  }

  /** The main value as a multiplier: 71,29 % becomes 0,7129. */
  public BigDecimal factor() {
    return reference.code().percentValue()
        ? row.getPrimaryValue().divide(HUNDRED, 4, RoundingMode.HALF_UP)
        : row.getPrimaryValue();
  }

  public BigDecimal secondValue() {
    return row.getSecondaryValue();
  }

  public BigDecimal thirdValue() {
    return row.getTertiaryValue();
  }

  public String band() {
    return row.band();
  }
}
