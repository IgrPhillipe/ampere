package br.com.ampere.domain;

/** Whom the loads serve: the condominium (Ds), a commercial unit (Dc) or one apartment. */
public enum LoadUsage {
  COMMON_AREA(
      "Área comum",
      DemandComponent.CONDOMINIUM_SERVICES,
      "COLLECTIVE_ADMINISTRATION_LIGHTING",
      "COLLECTIVE_ADMINISTRATION_OUTLETS",
      "RESIDENTIAL"),
  COMMERCIAL(
      "Carga comercial", DemandComponent.NON_RESIDENTIAL_UNITS, "STORES", "STORES", "COMMERCIAL"),
  /** Loads of a three-phase apartment: parcel a reads Tabela 6, not Tabela 22. */
  APARTMENT("Apartamento", DemandComponent.RESIDENTIAL_UNITS, null, null, "RESIDENTIAL");

  private final String label;
  private final DemandComponent component;
  private final String lightingKey;
  private final String outletsKey;
  private final String airConditioningKey;

  LoadUsage(
      String label,
      DemandComponent component,
      String lightingKey,
      String outletsKey,
      String airConditioningKey) {
    this.label = label;
    this.component = component;
    this.lightingKey = lightingKey;
    this.outletsKey = outletsKey;
    this.airConditioningKey = airConditioningKey;
  }

  public String label() {
    return label;
  }

  public DemandComponent component() {
    return component;
  }

  /** Row of Tabela 22 for the lighting of this occupancy. */
  public String lightingKey() {
    return lightingKey;
  }

  /** Row of Tabela 22 for the general-use outlets of this occupancy. */
  public String outletsKey() {
    return outletsKey;
  }

  /** Column of Tabela 12. */
  public String airConditioningKey() {
    return airConditioningKey;
  }
}
