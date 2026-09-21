package br.com.ampere.domain;

/** Padrão de entrada: whether metering is grouped or one per unit. DIS-NOR-053, item 6.17. */
public enum EntranceStandard {
  COLLECTIVE("Coletivo"),
  INDIVIDUAL("Individual");

  private final String label;

  EntranceStandard(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
