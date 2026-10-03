package br.com.ampere.domain;

/**
 * Tipos de documento que podem ser anexados a um projeto antes do envio.
 *
 * <p>Cada projeto precisa de um documento de cada tipo para poder ser submetido. A ART (Anotacao de
 * Responsabilidade Tecnica) e obrigatoria por lei; o diagrama unifilar e a planta de situacao sao
 * exigidos pela distribuidora (DIS-NOR-053).
 */
public enum DocumentType {
  ART("ART"),
  DIAGRAMA_UNIFILAR("Diagrama unifilar"),
  PLANTA_DE_SITUACAO("Planta de situação");

  private final String label;

  DocumentType(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
