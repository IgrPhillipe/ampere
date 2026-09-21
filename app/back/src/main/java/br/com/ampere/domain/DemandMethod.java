package br.com.ampere.domain;

/** How a demand component is calculated. */
public enum DemandMethod {
  FLOOR_AREA("Área útil"),
  INSTALLED_LOAD("Carga instalada");

  private final String label;

  DemandMethod(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
