package br.com.ampere.domain;

/** The standards that govern demand calculation today. */
public enum StandardName {
  DIS_NOR_030("DIS-NOR-030"),
  DIS_NOR_053("DIS-NOR-053");

  private final String code;

  StandardName(String code) {
    this.code = code;
  }

  public String code() {
    return code;
  }
}
