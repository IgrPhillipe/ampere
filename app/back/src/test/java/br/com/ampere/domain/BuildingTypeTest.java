package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class BuildingTypeTest {

  @Test
  void residentialCombinesFloorAreaForUnitsAndInstalledLoadForServices() {
    assertThat(residential().demandRules())
        .extracting(
            DemandRule::component,
            DemandRule::method,
            DemandRule::prescribedBy,
            DemandRule::prescribedItem,
            DemandRule::methodFrom)
        .containsExactly(
            tuple(
                DemandComponent.RESIDENTIAL_UNITS,
                DemandMethod.FLOOR_AREA,
                StandardName.DIS_NOR_053,
                "6.22.1",
                StandardName.DIS_NOR_053),
            tuple(
                DemandComponent.CONDOMINIUM_SERVICES,
                DemandMethod.INSTALLED_LOAD,
                StandardName.DIS_NOR_053,
                "6.22.4",
                StandardName.DIS_NOR_030));
  }

  @Test
  void nonResidentialUsesInstalledLoadOnly() {
    assertThat(nonResidential().demandRules())
        .extracting(DemandRule::component, DemandRule::method, DemandRule::prescribedItem)
        .containsExactly(
            tuple(DemandComponent.NON_RESIDENTIAL_UNITS, DemandMethod.INSTALLED_LOAD, "6.23.1"));
  }

  @Test
  void mixedSumsTheResidentialAndTheNonResidentialParcels() {
    assertThat(mixed().demandRules())
        .extracting(DemandRule::component, DemandRule::method, DemandRule::prescribedItem)
        .containsExactly(
            tuple(DemandComponent.RESIDENTIAL_UNITS, DemandMethod.FLOOR_AREA, "6.24.1"),
            tuple(DemandComponent.NON_RESIDENTIAL_UNITS, DemandMethod.INSTALLED_LOAD, "6.24.1"));
  }

  @Test
  void derivesTheApplicableStandardsFromItsOwnRules() {
    List<DemandRule> residential = residential().demandRules();
    List<DemandRule> nonResidential = nonResidential().demandRules();
    List<DemandRule> mixed = mixed().demandRules();

    assertThat(residential).isNotEqualTo(nonResidential);
    assertThat(residential).isNotEqualTo(mixed);
    assertThat(nonResidential).isNotEqualTo(mixed);
  }

  @Test
  void appliesBothCurrentStandardsWhateverTheBuildingType() {
    Set<StandardName> both = Set.of(StandardName.DIS_NOR_053, StandardName.DIS_NOR_030);

    assertThat(residential().applicableStandards()).isEqualTo(both);
    assertThat(nonResidential().applicableStandards()).isEqualTo(both);
    assertThat(mixed().applicableStandards()).isEqualTo(both);
  }

  @Test
  void rejectsMissingTechnicalParameters() {
    assertThatThrownBy(
            () ->
                new ResidentialMultifamily(
                    null,
                    SupplyVoltage.V380_220,
                    ConnectionType.THREE_PHASE,
                    EntranceStandard.COLLECTIVE))
        .isInstanceOf(NullPointerException.class);
    assertThatThrownBy(
            () -> new Mixed(8, null, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE))
        .isInstanceOf(NullPointerException.class);
    assertThatThrownBy(
            () -> new NonResidential(8, SupplyVoltage.V220_127, null, EntranceStandard.INDIVIDUAL))
        .isInstanceOf(NullPointerException.class);
    assertThatThrownBy(
            () -> new NonResidential(8, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, null))
        .isInstanceOf(NullPointerException.class);
  }

  private static BuildingType residential() {
    return new ResidentialMultifamily(
        12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }

  private static BuildingType nonResidential() {
    return new NonResidential(
        6, SupplyVoltage.V220_127, ConnectionType.SINGLE_PHASE, EntranceStandard.INDIVIDUAL);
  }

  private static BuildingType mixed() {
    return new Mixed(
        18, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }
}
