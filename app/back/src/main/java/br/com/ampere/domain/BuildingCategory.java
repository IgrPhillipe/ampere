package br.com.ampere.domain;

/** The building type a project declares. Each constant builds its own subclass. */
public enum BuildingCategory {
  RESIDENTIAL_MULTIFAMILY {
    @Override
    public BuildingType create(
        Integer floors,
        SupplyVoltage voltage,
        ConnectionType connectionType,
        EntranceStandard entranceStandard) {
      return new ResidentialMultifamily(floors, voltage, connectionType, entranceStandard);
    }
  },
  NON_RESIDENTIAL {
    @Override
    public BuildingType create(
        Integer floors,
        SupplyVoltage voltage,
        ConnectionType connectionType,
        EntranceStandard entranceStandard) {
      return new NonResidential(floors, voltage, connectionType, entranceStandard);
    }
  },
  MIXED {
    @Override
    public BuildingType create(
        Integer floors,
        SupplyVoltage voltage,
        ConnectionType connectionType,
        EntranceStandard entranceStandard) {
      return new Mixed(floors, voltage, connectionType, entranceStandard);
    }
  };

  public abstract BuildingType create(
      Integer floors,
      SupplyVoltage voltage,
      ConnectionType connectionType,
      EntranceStandard entranceStandard);
}
