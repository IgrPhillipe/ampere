package br.com.ampere.domain;

import java.util.Arrays;

public enum StandardName {
  DIS_NOR_053("DIS-NOR-053"),
  DIS_NOR_030("DIS-NOR-030");

  private final String code;

  StandardName(String code) {
    this.code = code;
  }

  public String code() {
    return code;
  }

  /** "053", as the calculation screen abbreviates it. */
  public String shortCode() {
    return code.substring(code.lastIndexOf('-') + 1);
  }

  public static StandardName of(String code) {
    return Arrays.stream(values())
        .filter(standard -> standard.code.equals(code))
        .findFirst()
        .orElseThrow(() -> new IllegalStateException("Unknown standard: " + code));
  }
}
