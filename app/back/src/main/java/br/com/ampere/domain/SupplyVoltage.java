package br.com.ampere.domain;

/** Supply voltage of a building, as DIS-NOR-053 Anexo I item 8 states it. */
public enum SupplyVoltage {
  V220_127("220/127 V"),
  V380_220("380/220 V");

  private final String label;

  SupplyVoltage(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
