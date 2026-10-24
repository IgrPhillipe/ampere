package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.SupplyVoltage;

/** The parameters of a project, already converted. The service does not know about DTOs. */
public record ProjectParameters(
    String name,
    String postalCode,
    BrazilianState state,
    String municipality,
    String address,
    BuildingCategory buildingType,
    Integer floors,
    SupplyVoltage voltage,
    ConnectionType connectionType,
    EntranceStandard entranceStandard) {

  public BuildingType toBuildingType() {
    return buildingType.create(floors, voltage, connectionType, entranceStandard);
  }
}
