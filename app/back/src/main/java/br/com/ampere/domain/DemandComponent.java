package br.com.ampere.domain;

/** A share of the total demand, in the notation of DIS-NOR-053 Anexo I. */
public enum DemandComponent {
  RESIDENTIAL_UNITS("Drf"),
  CONDOMINIUM_SERVICES("Ds"),
  NON_RESIDENTIAL_UNITS("Dc");

  private final String symbol;

  DemandComponent(String symbol) {
    this.symbol = symbol;
  }

  public String symbol() {
    return symbol;
  }
}
