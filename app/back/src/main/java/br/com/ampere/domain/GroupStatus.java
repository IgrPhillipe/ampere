package br.com.ampere.domain;

/** Where a consumer unit group stands before the demand can be calculated. */
public enum GroupStatus {
  VALIDATED("Validado"),
  REVIEW("Revisar"),
  MISSING_DATA("Falta dado");

  private final String label;

  GroupStatus(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
