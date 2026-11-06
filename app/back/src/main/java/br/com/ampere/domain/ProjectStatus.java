package br.com.ampere.domain;

/** Current stage of a project in the submission and review workflow. */
public enum ProjectStatus {
  DRAFT("Rascunho"),
  AWAITING_SUBMISSION("Aguardando Envio"),
  UNDER_REVIEW("Em Análise"),
  REJECTED("Reprovado"),
  APPROVED("Aprovado");

  private final String label;

  ProjectStatus(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
