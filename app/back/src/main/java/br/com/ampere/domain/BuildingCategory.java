package br.com.ampere.domain;

/** The building type a project declares. Each constant builds its own subclass. */
public enum BuildingCategory {
  RESIDENTIAL_MULTIFAMILY("Residencial multifamiliar") {
    @Override
    public BuildingType create(
        Integer floors,
        SupplyVoltage voltage,
        ConnectionType connectionType,
        EntranceStandard entranceStandard) {
      return new ResidentialMultifamily(floors, voltage, connectionType, entranceStandard);
    }
  },
  NON_RESIDENTIAL("Não residencial") {
    @Override
    public BuildingType create(
        Integer floors,
        SupplyVoltage voltage,
        ConnectionType connectionType,
        EntranceStandard entranceStandard) {
      return new NonResidential(floors, voltage, connectionType, entranceStandard);
    }
  },
  MIXED("Misto") {
    @Override
    public BuildingType create(
        Integer floors,
        SupplyVoltage voltage,
        ConnectionType connectionType,
        EntranceStandard entranceStandard) {
      return new Mixed(floors, voltage, connectionType, entranceStandard);
    }
  };

  private final String label;

  BuildingCategory(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }

  public abstract BuildingType create(
      Integer floors,
      SupplyVoltage voltage,
      ConnectionType connectionType,
      EntranceStandard entranceStandard);
}
