package br.com.ampere.domain;

public enum FindingStage {
  PROJECT_DATA("Dados da Edificação"),
  CONSUMER_UNITS("Unidades Consumidoras"),
  CALCULATION("Cálculo de Demanda"),
  DOCUMENTS("Documentos");

  private final String label;

  FindingStage(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
