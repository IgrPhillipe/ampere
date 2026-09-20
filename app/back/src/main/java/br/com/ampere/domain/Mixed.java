package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

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
  public String applicableStandard() {
    if (getEntranceStandard() == EntranceStandard.INDIVIDUAL) {
      return "DIS-NOR-030";
    }
    return "DIS-NOR-053";
  }
}
