package br.com.ampere.domain;

import static br.com.ampere.domain.DemandFixtures.apartments;
import static br.com.ampere.domain.DemandFixtures.charging;
import static br.com.ampere.domain.DemandFixtures.context;
import static br.com.ampere.domain.DemandFixtures.item;
import static br.com.ampere.domain.DemandFixtures.lighting;
import static br.com.ampere.domain.DemandFixtures.loads;
import static br.com.ampere.domain.DemandFixtures.motor;
import static br.com.ampere.domain.DemandFixtures.outlets;
import static br.com.ampere.domain.DemandFixtures.project;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

import java.util.List;
import org.junit.jupiter.api.Test;

class DemandEngineTest {

  private static final Project PROJECT = project(SupplyVoltage.V380_220);

  /** The draft of prototype H3, once its two pending groups are fixed. */
  private static List<ConsumerUnitGroup> prototypeH3() {
    return List.of(
        apartments(PROJECT, "Apartamento tipo A", 24, "68", false),
        apartments(PROJECT, "Apartamento tipo B", 20, "92", false),
        apartments(PROJECT, "Cobertura duplex", 4, "140", false),
        loads(
            PROJECT,
            LoadUsage.COMMON_AREA,
            motor("Elevador", 1, "12"),
            item(LoadCategory.PUMPS_AND_HOT_TUBS, "Bombas de recalque", 2, "5", PowerUnit.CV),
            lighting("Iluminação", "10", LampTechnology.COMPACT_FLUORESCENT_LED),
            outlets("15.8")),
        charging(PROJECT, 6, "7.40"));
  }

  @Test
  void calculatesEveryStepOfThePrototypeProject() {
    DemandResult result =
        DemandEngine.run(
            prototypeH3(), context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.steps())
        .extracting(DemandStep::code, DemandStep::applies, step -> step.valueKva().toPlainString())
        .containsExactly(
            tuple("Drf", true, "77.44"),
            tuple("Ds", true, "41.23"),
            tuple("Dc", false, "0.00"),
            tuple("Dve", true, "44.40"),
            tuple("Ded", true, "165.00"));
    assertThat(result.calculatedKva()).isEqualByComparingTo("163.07");
    assertThat(result.finalKva()).isEqualByComparingTo("165");
    assertThat(result.serviceEntrance().band()).isEqualTo("135 < De ≤ 165");
    assertThat(result.serviceEntrance().cableSectionMm2()).isEqualByComparingTo("150");
    assertThat(result.serviceEntrance().breakerAmps()).isEqualByComparingTo("250");
    assertThat(result.currentAmps()).isEqualByComparingTo("247.8");
  }

  @Test
  void writesEachFormulaAsTheScreenShowsIt() {
    DemandResult result =
        DemandEngine.run(
            prototypeH3(), context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.steps())
        .extracting(DemandStep::formula)
        .containsExactly(
            "(24 × 1,57 + 20 × 2,06 + 4 × 2,91) × 0,7129 × 1,2",
            "a + g + i = 20,40 + 14,09 + 6,74",
            "Não se aplica: nenhum grupo deste tipo no projeto",
            "(6 × 7,40) kW × 1,00",
            "Drf + Ds + Dc + Dve = 77,44 + 41,23 + 0,00 + 44,40 = 163,07 kVA");
    assertThat(result.steps().get(0).details())
        .contains(
            "Apartamento tipo A: 24 × 1,57 kVA (Quadro 35, 66 a 70 m²)",
            "Fc para 48 apartamentos: 71,29 % (Quadro 36)",
            "Dr = 90,52 × 0,7129 = 64,53 kVA",
            "Fr = 1,2 (Quadro 37, 50 < Dr ≤ 100 kVA)");
    assertThat(result.steps().get(1).details())
        .contains(
            "a · Iluminação e tomadas: 10,00 kW ÷ 0,80 × 1,00 + 15,80 kW × 0,50 = 20,40 kVA",
            "Elevador: 12 CV lido na linha de 12½ cv da Tabela 19, 14,09 kVA",
            "i · Bombas e hidromassagem: 2 × 6,02 × 0,56 = 6,74 kVA");
    assertThat(result.steps().get(1).reference().label()).isEqualTo("Tabela 22 · 030");
  }

  @Test
  void runsTheSameFiveChecksOnEveryCalculation() {
    DemandResult result =
        DemandEngine.run(
            prototypeH3(), context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.checks())
        .extracting(CalculationCheck::getCode, CalculationCheck::getStatus)
        .containsExactly(
            tuple("MINIMUM_BY_VOLTAGE", CheckStatus.INFO),
            tuple("TRANSFORMER_LIMIT", CheckStatus.SKIPPED),
            tuple("NETWORK_STUDY", CheckStatus.WARNING),
            tuple("PROJECT_SIZE", CheckStatus.INFO),
            tuple("SAFETY_FACTOR", CheckStatus.PASSED));
  }

  @Test
  void recordsEveryTableItRead() {
    DemandResult result =
        DemandEngine.run(
            prototypeH3(), context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.appliedTables())
        .extracting(NormativeReference::identification)
        .containsExactlyInAnyOrder(
            "Quadro 35",
            "Quadro 36",
            "Quadro 37",
            "Tabela 22",
            "Tabela 14",
            "Tabela 19",
            "Tabela 16",
            "Quadro 33",
            "Tabela 2");
  }

  @Test
  void aSingleGroupStillGetsTheBuildingWideCoincidence() {
    DemandResult result =
        DemandEngine.run(
            List.of(apartments(PROJECT, 30, "40")),
            context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.residential().coincidenceFactor()).isEqualByComparingTo("0.7827");
  }

  @Test
  void theCoincidenceOfTheBuildingIsNotTheOneOfEachGroup() {
    DemandResult result =
        DemandEngine.run(
            List.of(apartments(PROJECT, 10, "40"), apartments(PROJECT, 10, "40")),
            context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.residential().apartments()).isEqualTo(20);
    assertThat(result.residential().coincidenceFactor()).isEqualByComparingTo("0.8720");
  }

  @Test
  void compactUnitsAboveFifteenTakeTheFixedNinetyPercent() {
    DemandResult result =
        DemandEngine.run(
            List.of(apartments(PROJECT, "Studio", 20, "30", true)),
            context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.residential().coincidenceFactor()).isEqualByComparingTo("0.90");
    assertThat(result.steps().get(0).details())
        .anyMatch(line -> line.startsWith("Fc fixo de 90 %"));
  }

  @Test
  void quadro33GoesOnEveryChargingPointOfTheBuilding() {
    DemandResult result =
        DemandEngine.run(
            List.of(charging(PROJECT, 8, "7.40"), charging(PROJECT, 8, "7.40")),
            context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.valueOf(DemandComponent.EV_CHARGING)).isEqualByComparingTo("101.82");
  }

  @Test
  void commercialLoadsBecomeDc() {
    DemandResult result =
        DemandEngine.run(
            List.of(
                loads(
                    PROJECT,
                    "Lojas",
                    4,
                    LoadUsage.COMMERCIAL,
                    lighting("Iluminação", "2", LampTechnology.FLUORESCENT_NEON_SODIUM),
                    item(
                        LoadCategory.AIR_CONDITIONING, "Ar-condicionado", 3, "1.6", PowerUnit.KW))),
            context(SupplyVoltage.V220_127, ConnectionType.THREE_PHASE));

    assertThat(result.steps().get(0).applies()).isFalse();
    assertThat(result.valueOf(DemandComponent.NON_RESIDENTIAL_UNITS)).isEqualByComparingTo("25.70");
    assertThat(result.residential()).isNull();
    assertThat(result.checks())
        .filteredOn(check -> check.getCode().equals("SAFETY_FACTOR"))
        .extracting(CalculationCheck::getStatus)
        .containsExactly(CheckStatus.SKIPPED);
  }

  @Test
  void aDemandAboveTheLastBandIsCalculatedWithAWarning() {
    DemandResult result =
        DemandEngine.run(
            List.of(apartments(PROJECT, 200, "300")),
            context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.serviceEntrance()).isNull();
    assertThat(result.minimumKva()).isNull();
    assertThat(result.finalKva()).isEqualByComparingTo(result.calculatedKva());
    assertThat(result.checks().get(0).getStatus()).isEqualTo(CheckStatus.WARNING);
    assertThat(result.steps().get(4).details().get(0))
        .startsWith("Acima da última faixa da Tabela 2");
  }

  @Test
  void theServiceEntranceTablesAreThreePhase() {
    DemandResult result =
        DemandEngine.run(
            List.of(apartments(PROJECT, 20, "40")),
            context(SupplyVoltage.V220_127, ConnectionType.TWO_PHASE));

    assertThat(result.checks().get(0))
        .extracting(CalculationCheck::getStatus, CalculationCheck::getMessage)
        .containsExactly(
            CheckStatus.WARNING,
            "A Tabela 1 dimensiona a entrada trifásica de edificação coletiva. Com ligação"
                + " bifásico, confira a entrada pela DIS-NOR-030, item 6.28.");
  }

  @Test
  void thousandsOfEqualUnitsAreCountedNotListed() {
    DemandResult result =
        DemandEngine.run(
            List.of(
                loads(
                    PROJECT,
                    "Galpões",
                    10000,
                    LoadUsage.COMMERCIAL,
                    motor("Esteiras", 10000, "1"),
                    lighting("Iluminação", "1", LampTechnology.COMPACT_FLUORESCENT_LED))),
            context(SupplyVoltage.V380_220, ConnectionType.THREE_PHASE));

    assertThat(result.steps().get(2).details())
        .anyMatch(line -> line.contains("1,52 × 1,00 + (99999999 × 1,52) × 0,50"));
  }

  @Test
  void anUnpublishedTableIsReportedByName() {
    DemandContext context =
        new DemandContext(
            new NormativeTableSet(List.of()), SupplyVoltage.V380_220, ConnectionType.THREE_PHASE);

    assertThatThrownBy(() -> DemandEngine.run(List.of(apartments(PROJECT, 20, "40")), context))
        .isInstanceOf(MissingNormativeValueException.class)
        .hasMessage(
            "O Quadro 35 da DIS-NOR-053 não está publicado. Cadastre e publique a tabela em Normas"
                + " e tabelas.");
  }
}
