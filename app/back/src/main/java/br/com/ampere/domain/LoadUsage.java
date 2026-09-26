package br.com.ampere.domain;

/** Whether a load group serves the condominium (Ds) or a commercial unit (Dc). */
public enum LoadUsage {
  COMMON_AREA("Área comum"),
  COMMERCIAL("Carga comercial");

  private final String label;

  LoadUsage(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
