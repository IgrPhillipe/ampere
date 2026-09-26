package br.com.ampere.domain;

public enum NormativeTableStatus {
  DRAFT("Rascunho"),
  PUBLISHED("Publicada"),
  SUPERSEDED("Substituída");

  private final String label;

  NormativeTableStatus(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
