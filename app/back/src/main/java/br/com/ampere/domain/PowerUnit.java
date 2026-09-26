package br.com.ampere.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Unit a nameplate power is declared in.
 *
 * <p>The conversion is the physical one and only feeds the declared installed load. Converting a
 * motor to kVA for the demand is Tabela 18 of DIS-NOR-030, and belongs to the calculation.
 */
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
