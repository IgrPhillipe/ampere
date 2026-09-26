package br.com.ampere.domain;

/** How charging points are fed (DIS-NOR-030 item 6.27.10). */
public enum EvStationType {
  INDIVIDUAL("Individualizado por unidade"),
  COLLECTIVE("Coletivo");

  private final String label;

  EvStationType(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
