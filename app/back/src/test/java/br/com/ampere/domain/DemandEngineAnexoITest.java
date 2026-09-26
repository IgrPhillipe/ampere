package br.com.ampere.domain;

import static br.com.ampere.domain.DemandFixtures.apartments;
import static br.com.ampere.domain.DemandFixtures.context;
import static br.com.ampere.domain.DemandFixtures.lighting;
import static br.com.ampere.domain.DemandFixtures.loads;
import static br.com.ampere.domain.DemandFixtures.motor;
import static br.com.ampere.domain.DemandFixtures.outlets;
import static br.com.ampere.domain.DemandFixtures.project;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

/**
 * The worked examples of DIS-NOR-053 REV 06, Anexo I (pp. 113–133). A mistyped table value still
 * looks plausible; these are what catch it.
 */
class DemandEngineAnexoITest {

  private static final BigDecimal CENT = new BigDecimal("0.01");

  /**
   * Parcel a closes at 4,50 kVA, not the 4,69 of the example: the outlets take power factor 1,00
   * from DIS-NOR-030 item 6.27.1.2, as Anexo I item 7.2 orders.
   */
  @Test
  void example1ResidentialBuildingOf20ApartmentsAt380V() {
    Project project = project(SupplyVoltage.V380_220);
    DemandResult result =
        DemandEngine.run(
            List.of(
                apartments(project, 20, "40"),
                loads(
                    project,
                    LoadUsage.COMMON_AREA,
                    lighting("Iluminação", "3", LampTechnology.COMPACT_FLUORESCENT_LED),
                    outlets("1.5"),
                    motor("Motor", 1, "1"))),
            context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    ResidentialTrace residential = result.residential();
    assertThat(residential.apartments()).isEqualTo(20);
    assertThat(residential.coincidenceFactor()).isEqualByComparingTo("0.8720");
    assertThat(residential.residentialDemand()).isEqualByComparingTo("17.44");
    assertThat(residential.safetyFactor()).isEqualByComparingTo("1.5");
    assertThat(result.valueOf(DemandComponent.RESIDENTIAL_UNITS)).isEqualByComparingTo("26.16");
    assertThat(result.valueOf(DemandComponent.CONDOMINIUM_SERVICES)).isEqualByComparingTo("6.02");
    assertThat(result.calculatedKva()).isEqualByComparingTo("32.18");

    assertThat(result.minimumApplied()).isTrue();
    assertThat(result.finalKva()).isEqualByComparingTo("46");
    assertThat(result.serviceEntrance().cableSectionMm2()).isEqualByComparingTo("16");
    assertThat(result.serviceEntrance().breakerAmps()).isEqualByComparingTo("70");
    assertThat(result.currentAmps()).isEqualByComparingTo("48.9");
  }

  /**
   * The example takes both elevators and both pumps as motors (parcel g) and closes g at 29,01
   * truncated; rounded it is 29,02. Parcel a uses the factor of collective building administration
   * (1,00 lighting, 0,50 outlets), as Example 1 does, where Example 2 takes 1,00 for both; the
   * total still falls in the 229 kVA band.
   */
  @Test
  void example2ResidentialBuildingOf76ApartmentsAt220V() {
    Project project = project(SupplyVoltage.V220_127);
    DemandResult result =
        DemandEngine.run(
            List.of(
                apartments(project, 76, "128"),
                loads(
                    project,
                    LoadUsage.COMMON_AREA,
                    lighting("Iluminação", "5.8", LampTechnology.COMPACT_FLUORESCENT_LED),
                    outlets("3.8"),
                    motor("Elevadores", 2, "15"),
                    motor("Bombas d'água", 2, "3"))),
            context(SupplyVoltage.V220_127, ConnectionType.THREE_PHASE));

    ResidentialTrace residential = result.residential();
    assertThat(residential.coincidenceFactor()).isEqualByComparingTo("0.6823");
    assertThat(residential.residentialDemand()).isEqualByComparingTo("141.56");
    assertThat(residential.safetyFactor()).isEqualByComparingTo("1.1");
    assertThat(result.valueOf(DemandComponent.RESIDENTIAL_UNITS)).isEqualByComparingTo("155.72");
    assertThat(result.steps().get(1).details())
        .anyMatch(line -> line.startsWith("g) Motores e máquinas de solda a motor: 16,65 × 1,00"));
    assertThat(result.valueOf(DemandComponent.CONDOMINIUM_SERVICES))
        .isCloseTo(new BigDecimal("9.15").add(new BigDecimal("29.01")), within(CENT));

    assertThat(result.finalKva()).isEqualByComparingTo("229");
    assertThat(result.serviceEntrance().circuits()).isEqualTo(3);
    assertThat(result.serviceEntrance().cableSectionMm2()).isEqualByComparingTo("185");
    assertThat(result.serviceEntrance().breakerAmps()).isEqualByComparingTo("600");
  }

  @Disabled("Agrupamento de blocos (Dte, Anexo I item 9) fora do recorte da US04: uma torre só")
  @Test
  void example3ThreeBlocksGroupedBeforeTheFactors() {}

  @Disabled("Valores a transcrever do PDF, pp. 126–130: comercial com parcela f")
  @Test
  void example4CommercialBuildingWithAirConditioning() {}

  @Disabled("Valores a transcrever do PDF, pp. 131–133: 19 apartamentos de 30 m² em 380/220 V")
  @Test
  void example5SmallResidentialBuilding() {}
}
