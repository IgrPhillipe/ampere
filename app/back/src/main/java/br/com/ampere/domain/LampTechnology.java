package br.com.ampere.domain;

import java.math.BigDecimal;

/** Sets the power factor of parcel a (DIS-NOR-030 item 6.27.1.2). */
public enum LampTechnology {
  FLUORESCENT_NEON_SODIUM("Fluorescente, néon ou vapor de sódio", "0.95"),
  COMPACT_FLUORESCENT_LED("Fluorescente compacta ou LED", "0.80");

  private final String label;
  private final BigDecimal powerFactor;

  LampTechnology(String label, String powerFactor) {
    this.label = label;
    this.powerFactor = new BigDecimal(powerFactor);
  }

  public String label() {
    return label;
  }

  public BigDecimal powerFactor() {
    return powerFactor;
  }
}
