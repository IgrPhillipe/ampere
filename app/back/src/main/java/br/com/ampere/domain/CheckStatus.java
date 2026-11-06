package br.com.ampere.domain;

public enum CheckStatus {
  PASSED("Conforme"),
  INFO("Informativo"),
  WARNING("Alerta"),
  SKIPPED("Não Verificado");

  private final String label;

  CheckStatus(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
