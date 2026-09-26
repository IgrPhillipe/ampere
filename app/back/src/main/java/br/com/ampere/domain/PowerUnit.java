package br.com.ampere.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Physical conversion only; the kVA of a motor (Tabela 18) belongs to the calculation. */
public enum PowerUnit {
  KW("kW", BigDecimal.ONE),
  CV("CV", new BigDecimal("0.7355")),
  HP("HP", new BigDecimal("0.7457"));

  private static final int SCALE = 4;

  private final String label;
  private final BigDecimal kilowatts;

  PowerUnit(String label, BigDecimal kilowatts) {
    this.label = label;
    this.kilowatts = kilowatts;
  }

  public String label() {
    return label;
  }

  public BigDecimal toKilowatts(BigDecimal power) {
    return power.multiply(kilowatts);
  }

  public BigDecimal toCv(BigDecimal power) {
    return toKilowatts(power).divide(CV.kilowatts, SCALE, RoundingMode.HALF_UP);
  }
}
