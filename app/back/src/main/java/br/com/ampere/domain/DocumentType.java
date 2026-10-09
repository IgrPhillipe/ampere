package br.com.ampere.domain;

/** A document the designer attaches before submitting the project. */
public enum DocumentType {
  ART("ART"),
  SINGLE_LINE_DIAGRAM("Diagrama unifilar"),
  SITE_PLAN("Planta de situação");

  private final String label;

  DocumentType(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
