package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.List;

/** Building that mixes residential and non-residential consumer units. */
@Entity
@DiscriminatorValue("MIXED")
public class Mixed extends BuildingType {

  protected Mixed() {}

  public Mixed(
      Integer floors,
      SupplyVoltage voltage,
      ConnectionType connectionType,
      EntranceStandard entranceStandard) {
    super(floors, voltage, connectionType, entranceStandard);
  }

  @Override
  public BuildingCategory category() {
    return BuildingCategory.MIXED;
  }

  @Override
  public List<DemandRule> demandRules() {
    return List.of(
        new DemandRule(
            DemandComponent.RESIDENTIAL_UNITS,
            DemandMethod.FLOOR_AREA,
            StandardName.DIS_NOR_053,
            "6.24.1",
            StandardName.DIS_NOR_053,
            "Anexo I"),
        new DemandRule(
            DemandComponent.NON_RESIDENTIAL_UNITS,
            DemandMethod.INSTALLED_LOAD,
            StandardName.DIS_NOR_053,
            "6.24.1",
            StandardName.DIS_NOR_030,
            "6.27"));
  }
}
