package br.com.ampere.domain;

import java.math.BigDecimal;

/**
 * What a parcel a item is: lighting, whose lamp sets the power factor, or general-use outlets
 * (DIS-NOR-030 item 6.27.1.2).
 */
public enum LampTechnology {
  FLUORESCENT_NEON_SODIUM("Fluorescente, néon ou vapor de sódio", "0.95", true),
  COMPACT_FLUORESCENT_LED("Fluorescente compacta ou LED", "0.80", true),
  GENERAL_OUTLETS("Tomadas de uso geral, sem lâmpadas", "1.00", false);

  private final String label;
  private final BigDecimal powerFactor;
  private final boolean lighting;

  LampTechnology(String label, String powerFactor, boolean lighting) {
    this.label = label;
    this.powerFactor = new BigDecimal(powerFactor);
    this.lighting = lighting;
  }

  public String label() {
    return label;
  }

  public BigDecimal powerFactor() {
    return powerFactor;
  }

  public boolean lighting() {
    return lighting;
  }
}
