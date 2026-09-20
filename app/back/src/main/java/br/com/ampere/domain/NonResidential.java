package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.List;

/** Commercial or industrial building with multiple consumer units. */
@Entity
@DiscriminatorValue("NON_RESIDENTIAL")
public class NonResidential extends BuildingType {

  protected NonResidential() {}

  public NonResidential(
      Integer floors,
      SupplyVoltage voltage,
      ConnectionType connectionType,
      EntranceStandard entranceStandard) {
    super(floors, voltage, connectionType, entranceStandard);
  }

  @Override
  public BuildingCategory category() {
    return BuildingCategory.NON_RESIDENTIAL;
  }

  @Override
  public List<DemandRule> demandRules() {
    return List.of(
        new DemandRule(
            DemandComponent.NON_RESIDENTIAL_UNITS,
            DemandMethod.INSTALLED_LOAD,
            StandardName.DIS_NOR_053,
            "6.23.1",
            StandardName.DIS_NOR_030,
            "6.27"));
  }
}
