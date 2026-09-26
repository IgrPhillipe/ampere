package br.com.ampere.domain;

/** Where a value was read: table, standard revision, item and printed page. */
public record NormativeReference(
    NormativeTableCode code,
    String identification,
    StandardName standard,
    String revision,
    String item,
    String page) {

  /** "Quadro 35 · 053", as the calculation screen prints it next to each step. */
  public String label() {
    return identification + " · " + standard.shortCode();
  }

  /** "Quadro 35 (DIS-NOR-053 REV 06)". */
  public String citation() {
    return identification + " (" + standard.code() + " " + revision + ")";
  }
}
