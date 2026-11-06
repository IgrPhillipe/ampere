package br.com.ampere.domain;

/** Where a project under review stands against its deadline. Calculated, never persisted. */
public enum DeadlineStatus {
  OVERDUE("Atrasado"),
  DUE_TODAY("Vence Hoje"),
  ON_TIME("No Prazo");

  private final String label;

  DeadlineStatus(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
