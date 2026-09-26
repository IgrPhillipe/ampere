package br.com.ampere.domain;

import static br.com.ampere.domain.DemandFixtures.context;
import static br.com.ampere.domain.DemandFixtures.item;
import static br.com.ampere.domain.DemandFixtures.lighting;
import static br.com.ampere.domain.DemandFixtures.motor;
import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class LoadCategoryDemandTest {

  private static final DemandContext THREE_PHASE =
      context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE);

  private static ParcelDemand demand(LoadCategory category, LoadItem... items) {
    return category.demand(List.of(items), 1, LoadUsage.COMMON_AREA, THREE_PHASE);
  }

  @Test
  void theLampSetsThePowerFactorOfTheLighting() {
    assertThat(
            demand(
                    LoadCategory.LIGHTING_AND_OUTLETS,
                    lighting("Fluorescente", "9.5", LampTechnology.FLUORESCENT_NEON_SODIUM))
                .kva())
        .isEqualByComparingTo("10.00");
    assertThat(
            demand(
                    LoadCategory.LIGHTING_AND_OUTLETS,
                    lighting("LED", "8", LampTechnology.COMPACT_FLUORESCENT_LED))
                .kva())
        .isEqualByComparingTo("10.00");
  }

  @Test
  void ofTwoEqualLargestMotorsOnlyOneCountsAsTheLargest() {
    ParcelDemand motors = demand(LoadCategory.MOTORS, motor("Elevadores", 2, "15"));

    assertThat(motors.kva()).isEqualByComparingTo("24.98");
  }

  @Test
  void motorsThatStartTogetherCountAsOne() {
    LoadItem together =
        new LoadItem(
            LoadCategory.MOTORS, "Esteiras", 2, new BigDecimal("15"), PowerUnit.CV, null, true);

    assertThat(demand(LoadCategory.MOTORS, together).kva()).isEqualByComparingTo("33.30");
  }

  @Test
  void aSinglePhaseBuildingReadsTheSinglePhaseMotorTable() {
    ParcelDemand motor =
        LoadCategory.MOTORS.demand(
            List.of(motor("Portão", 1, "1")),
            1,
            LoadUsage.COMMON_AREA,
            context(SupplyVoltage.V220_127, ConnectionType.SINGLE_PHASE));

    assertThat(motor.kva()).isEqualByComparingTo("1.56");
    assertThat(motor.references())
        .extracting(NormativeReference::identification)
        .contains("Tabela 18");
  }

  @Test
  void pumpsTakeTheFactorOfHowManyThereAre() {
    ParcelDemand pumps =
        demand(
            LoadCategory.PUMPS_AND_HOT_TUBS,
            item(LoadCategory.PUMPS_AND_HOT_TUBS, "Bombas", 3, "3", PowerUnit.CV));

    assertThat(pumps.kva()).isEqualByComparingTo("5.70");
  }

  @Test
  void appliancesUseThePowerFactorOfItem6274() {
    ParcelDemand appliances =
        demand(
            LoadCategory.APPLIANCES,
            item(LoadCategory.APPLIANCES, "Lavadoras", 2, "1.84", PowerUnit.KW));

    assertThat(appliances.kva()).isEqualByComparingTo("2.80");
  }

  @Test
  void theLargestSpecialEquipmentIsTheOnlyOneAtFullFactor() {
    ParcelDemand special =
        demand(
            LoadCategory.SPECIAL_EQUIPMENT,
            item(LoadCategory.SPECIAL_EQUIPMENT, "Raios-X", 1, "10", PowerUnit.KW),
            item(LoadCategory.SPECIAL_EQUIPMENT, "Solda", 1, "5", PowerUnit.KW));

    assertThat(special.kva()).isEqualByComparingTo("13.00");
  }

  @Test
  void theQuantityOfTheGroupMultipliesItsItems() {
    ParcelDemand heaters =
        LoadCategory.INSTANT_HEATING.demand(
            List.of(item(LoadCategory.INSTANT_HEATING, "Chuveiro", 1, "5.5", PowerUnit.KW)),
            4,
            LoadUsage.COMMERCIAL,
            THREE_PHASE);

    assertThat(heaters.kva()).isEqualByComparingTo("16.72");
    assertThat(heaters.lines().get(0)).contains("4 aparelhos, 22,00 kW × 0,76");
  }
}
