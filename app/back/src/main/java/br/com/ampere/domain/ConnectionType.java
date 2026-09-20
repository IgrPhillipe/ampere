package br.com.ampere.domain;

/** Tipo de ligação: how many phases feed the building. DIS-NOR-030, item 6.27. */
public enum ConnectionType {
  SINGLE_PHASE("Monofásico"),
  TWO_PHASE("Bifásico"),
  THREE_PHASE("Trifásico");

  private final String label;

  ConnectionType(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
