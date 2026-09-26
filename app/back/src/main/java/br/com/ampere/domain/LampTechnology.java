package br.com.ampere.domain;

/** Sets the power factor of parcel a (DIS-NOR-030 item 6.27.1). */
public enum LampTechnology {
  FLUORESCENT_NEON_SODIUM("Fluorescente, néon ou vapor de sódio"),
  COMPACT_FLUORESCENT_LED("Fluorescente compacta ou LED");

  private final String label;

  LampTechnology(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
