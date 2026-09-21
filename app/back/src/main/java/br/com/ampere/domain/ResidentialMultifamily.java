package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.List;

/** Residential building with multiple consumer units. */
@Entity
@DiscriminatorValue("RESIDENTIAL_MULTIFAMILY")
public class ResidentialMultifamily extends BuildingType {

  protected ResidentialMultifamily() {}

  public ResidentialMultifamily(
      Integer floors,
      SupplyVoltage voltage,
      ConnectionType connectionType,
      EntranceStandard entranceStandard) {
    super(floors, voltage, connectionType, entranceStandard);
  }

  @Override
  public BuildingCategory category() {
    return BuildingCategory.RESIDENTIAL_MULTIFAMILY;
  }

  @Override
  public List<DemandRule> demandRules() {
    return List.of(
        new DemandRule(
            DemandComponent.RESIDENTIAL_UNITS,
            DemandMethod.FLOOR_AREA,
            StandardName.DIS_NOR_053,
            "6.22.1",
            StandardName.DIS_NOR_053,
            "Anexo I"),
        new DemandRule(
            DemandComponent.CONDOMINIUM_SERVICES,
            DemandMethod.INSTALLED_LOAD,
            StandardName.DIS_NOR_053,
            "6.22.4",
            StandardName.DIS_NOR_030,
            "6.27"));
  }
}
