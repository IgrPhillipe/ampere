package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

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
  public String applicableStandard() {
    if (getEntranceStandard() == EntranceStandard.COLLECTIVE) {
      return "DIS-NOR-053";
    }
    return "DIS-NOR-030";
  }
}
