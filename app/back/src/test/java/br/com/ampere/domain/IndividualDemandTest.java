package br.com.ampere.domain;

import static br.com.ampere.domain.DemandFixtures.apartments;
import static br.com.ampere.domain.DemandFixtures.context;
import static br.com.ampere.domain.DemandFixtures.exemplo3;
import static br.com.ampere.domain.DemandFixtures.loads;
import static br.com.ampere.domain.DemandFixtures.motor;
import static br.com.ampere.domain.DemandFixtures.project;
import static br.com.ampere.domain.DemandFixtures.threePhaseApartments;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class IndividualDemandTest {

  private static final Project PROJECT = project(SupplyVoltage.V380_220);

  private static final DemandContext CONTEXT =
      context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE);

  /**
   * DIS-NOR-030 Exemplo 3 reaches 25,90 kVA. The engine differs where the example simplifies: the
   * oven goes to parcel e, parcel d keeps the power factor 0,92 of item 6.27.4, and a and g are not
   * rounded up to 2,20 and 2,30.
   */
  @Test
  void aThreePhaseApartmentAddsTheParcelsOfItem627() {
    IndividualDemand unit =
        threePhaseApartments(PROJECT, "Cobertura", 2, "180", exemplo3())
            .individualDemand(CONTEXT)
            .orElseThrow();

    assertThat(unit.lines().getFirst())
        .contains("a + b + d + e + f + g = 2,18 + 13,00 + 3,42 + 1,50 + 4,20 + 2,28 = 26,58 kVA");
    assertThat(unit.demandKva()).isEqualByComparingTo("26.58");
    assertThat(unit.installedKw()).isEqualByComparingTo("35.871");
    assertThat(unit.references())
        .extracting(NormativeReference::identification)
        .contains("Tabela 6", "Tabela 7", "Tabela 9", "Tabela 12", "Tabela 14", "Tabela 19");
  }

  @Test
  void theApartmentMotorsFollowItsOwnConnection() {
    IndividualDemand unit =
        threePhaseApartments(PROJECT, "Cobertura", 1, "180", List.of(motor("Bomba", 1, "1")))
            .individualDemand(context(SupplyVoltage.V220_127, ConnectionType.SINGLE_PHASE))
            .orElseThrow();

    assertThat(unit.references())
        .extracting(NormativeReference::identification)
        .contains("Tabela 19")
        .doesNotContain("Tabela 18");
  }

  @Test
  void aSinglePhaseApartmentIsSizedByItsInstalledLoad() {
    IndividualDemand unit = apartments(PROJECT, 10, "70").individualDemand(CONTEXT).orElseThrow();

    assertThat(unit.demandKva()).isNull();
    assertThat(unit.installedKw()).isEqualByComparingTo("5");
    assertThat(unit.lines())
        .containsExactly(
            "Apartamento tipo (monofásico): carga instalada de 5,00 kW, que define a categoria da"
                + " unidade (DIS-NOR-030, item 6.28.1)");
  }

  @Test
  void onlyApartmentsHaveAnIndividualDemand() {
    assertThat(
            loads(PROJECT, LoadUsage.COMMON_AREA, motor("Elevador", 1, "12"))
                .individualDemand(CONTEXT))
        .isEmpty();
  }

  @Test
  void theIndividualStepComesAfterTheBuildingAndStaysOutOfIt() {
    List<ConsumerUnitGroup> groups =
        List.of(
            apartments(PROJECT, 10, "70"),
            threePhaseApartments(PROJECT, "Cobertura", 2, "180", exemplo3()));

    DemandResult result = DemandEngine.run(groups, CONTEXT);

    DemandStep individual = result.steps().getLast();
    assertThat(individual.code()).isEqualTo("Dind");
    assertThat(individual.applies()).isTrue();
    assertThat(individual.valueKva()).isEqualByComparingTo("26.58");
    assertThat(individual.formula())
        .isEqualTo("Maior demanda individual trifásica: Cobertura, 26,58 kVA");
    assertThat(individual.details())
        .startsWith(
            "Apartamento tipo (monofásico): carga instalada de 5,00 kW, que define a categoria da"
                + " unidade (DIS-NOR-030, item 6.28.1)",
            "Cobertura (trifásico, carga instalada de 35,87 kW): a + b + d + e + f + g = 2,18 +"
                + " 13,00 + 3,42 + 1,50 + 4,20 + 2,28 = 26,58 kVA (DIS-NOR-030, item 6.27)");
    assertThat(result.steps().get(4).code()).isEqualTo("Ded");
    assertThat(result.steps().get(4).formula()).doesNotContain("Dind");
  }

  @Test
  void theLowVoltageCheckRecordsTheLargestUnit() {
    DemandResult result =
        DemandEngine.run(
            List.of(
                apartments(PROJECT, 10, "70"),
                threePhaseApartments(PROJECT, "Cobertura", 2, "180", exemplo3())),
            CONTEXT);

    assertThat(result.checks())
        .filteredOn(check -> check.getCode().equals("LOW_VOLTAGE_LIMIT"))
        .singleElement()
        .satisfies(
            check -> {
              assertThat(check.getStatus()).isEqualTo(CheckStatus.PASSED);
              assertThat(check.getMessage())
                  .isEqualTo(
                      "Maior carga instalada por apartamento de 35,87 kW, dentro do limite de 75 kW"
                          + " da baixa tensão (DIS-NOR-030, item 6.2.1).");
            });
  }

  @Test
  void withoutApartmentsTheIndividualStepDoesNotApply() {
    DemandResult result =
        DemandEngine.run(
            List.of(loads(PROJECT, LoadUsage.COMMON_AREA, motor("Elevador", 1, "12"))), CONTEXT);

    DemandStep individual = result.steps().getLast();
    assertThat(individual.code()).isEqualTo("Dind");
    assertThat(individual.applies()).isFalse();
    assertThat(individual.valueKva()).isEqualByComparingTo("0");
    assertThat(result.checks())
        .filteredOn(check -> check.getCode().equals("LOW_VOLTAGE_LIMIT"))
        .extracting(CalculationCheck::getStatus)
        .containsExactly(CheckStatus.SKIPPED);
  }
}
