package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

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
  public String applicableStandard() {
    if (getVoltage() == SupplyVoltage.V380_220
        && getEntranceStandard() == EntranceStandard.INDIVIDUAL) {
      return "DIS-NOR-030";
    }
    return "DIS-NOR-053";
  }
}
