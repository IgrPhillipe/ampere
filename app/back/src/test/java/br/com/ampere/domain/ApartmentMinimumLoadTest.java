package br.com.ampere.domain;

import static br.com.ampere.domain.DemandFixtures.lighting;
import static br.com.ampere.domain.DemandFixtures.outlets;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import br.com.ampere.config.NormativeTableSeed;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ApartmentMinimumLoadTest {

  private static final NormativeTables TABLES = DemandFixtures.tables();

  private static final LoadItem LED = lighting("Iluminação", "0.8", lamp());

  private static final LoadItem ENOUGH_OUTLETS = outlets("3.0");

  @Test
  void theResidenceOfExemplo3SitsExactlyOnTheMinimum() {
    assertThat(
            check(
                12,
                "180",
                List.of(outlets("3.0"), lighting("Iluminação", "1.2", lamp()), heater())))
        .isEmpty();
  }

  @Test
  void lightingAtTheMinimumOfTheRoomsPasses() {
    assertThat(check(8, "180", List.of(ENOUGH_OUTLETS, LED))).isEmpty();
  }

  @Test
  void lightingBelowTheMinimumOfTheRoomsIsReviewed() {
    assertThat(check(8, "180", List.of(ENOUGH_OUTLETS, lighting("Iluminação", "0.79", lamp()))))
        .extracting(ValidationIssue::severity, ValidationIssue::field, ValidationIssue::message)
        .containsExactly(
            tuple(
                IssueSeverity.REVIEW,
                "loads[1].power",
                "Iluminação de 0,79 kW abaixo do mínimo de 0,8 kW para 8 cômodos e corredores,"
                    + " 100 W por ponto de luz em cada um (DIS-NOR-030, item 6.26.1.1)."));
  }

  @Test
  void sumsTheQuantityOfEveryLightingItem() {
    LoadItem spots =
        new LoadItem(
            LoadCategory.LIGHTING_AND_OUTLETS,
            "Spots",
            4,
            new BigDecimal("0.15"),
            PowerUnit.KW,
            lamp(),
            null);

    assertThat(check(8, "180", List.of(ENOUGH_OUTLETS, spots, lighting("Sala", "0.2", lamp()))))
        .isEmpty();
  }

  @Test
  void roomsWithoutAnyLightingPointToTheRooms() {
    assertThat(check(1, "180", List.of(ENOUGH_OUTLETS, heater())))
        .extracting(ValidationIssue::field, ValidationIssue::message)
        .containsExactly(
            tuple(
                "rooms",
                "Iluminação de 0 kW abaixo do mínimo de 0,1 kW para 1 cômodo ou corredor, 100 W"
                    + " por ponto de luz em cada um (DIS-NOR-030, item 6.26.1.1)."));
  }

  @Test
  void withoutRoomsTheLightingIsNotChecked() {
    assertThat(check(null, "180", List.of(ENOUGH_OUTLETS, heater()))).isEmpty();
  }

  @ParameterizedTest
  @CsvSource({"180, 3.0", "200, 3.0", "200.01, 3.1", "8, 0.7", "250, 3.2"})
  void outletsAtTheMinimumOfTabela5Pass(String area, String minimumKw) {
    assertThat(check(8, area, List.of(outlets(minimumKw), LED))).isEmpty();
  }

  @Test
  void outletsBelowTabela5AreReviewed() {
    assertThat(check(8, "180", List.of(outlets("2.99"), LED)))
        .extracting(ValidationIssue::severity, ValidationIssue::field, ValidationIssue::message)
        .containsExactly(
            tuple(
                IssueSeverity.REVIEW,
                "loads[0].power",
                "Tomadas de 2,99 kW abaixo do mínimo de 3 kW para 180 m² de área útil"
                    + " (DIS-NOR-030, item 6.26.1.1, Tabela 5)."));
  }

  @Test
  void withoutAnyOutletTheIssuePointsToTheLoads() {
    assertThat(check(8, "60", List.of(LED, heater())))
        .extracting(ValidationIssue::field)
        .containsExactly("loads");
  }

  @Test
  void above250SquareMetresTheOutletsAreDeclaredAndNotChecked() {
    assertThat(check(8, "250.01", List.of(outlets("0.1"), LED))).isEmpty();
  }

  @Test
  void withoutUsefulAreaTheOutletsAreNotChecked() {
    assertThat(check(8, null, List.of(outlets("0.1"), LED))).isEmpty();
  }

  @Test
  void withoutTabela5TheOutletsAreNotCheckedButTheLightingIs() {
    NormativeTableSet withoutTabela5 =
        new NormativeTableSet(
            NormativeTableSeed.all(DemandFixtures.STANDARDS).stream()
                .filter(table -> table.getCode() != NormativeTableCode.T5_MINIMUM_OUTLETS)
                .toList());

    assertThat(
            new ApartmentMinimumLoad(8, new BigDecimal("180"))
                .check(
                    List.of(outlets("0.1"), lighting("Iluminação", "0.1", lamp())), withoutTabela5))
        .extracting(ValidationIssue::field)
        .containsExactly("loads[1].power");
  }

  @Test
  void anUnclassifiedLoadOfParcelAHoldsBothChecks() {
    LoadItem unclassified =
        new LoadItem(
            LoadCategory.LIGHTING_AND_OUTLETS,
            "Tomadas e iluminação",
            1,
            new BigDecimal("0.1"),
            PowerUnit.KW,
            null,
            null);

    assertThat(check(8, "180", List.of(unclassified))).isEmpty();
  }

  @Test
  void aLoadOfParcelAInBtuPerHourHoldsBothChecks() {
    LoadItem inBtu =
        new LoadItem(
            LoadCategory.LIGHTING_AND_OUTLETS,
            "Tomadas",
            1,
            new BigDecimal("10000"),
            PowerUnit.BTU_H,
            LampTechnology.GENERAL_OUTLETS,
            null);

    assertThat(check(8, "180", List.of(inBtu, LED))).isEmpty();
  }

  private static List<ValidationIssue> check(Integer rooms, String area, List<LoadItem> loads) {
    return new ApartmentMinimumLoad(rooms, area == null ? null : new BigDecimal(area))
        .check(loads, TABLES);
  }

  private static LampTechnology lamp() {
    return LampTechnology.COMPACT_FLUORESCENT_LED;
  }

  private static LoadItem heater() {
    return DemandFixtures.item(LoadCategory.INSTANT_HEATING, "Chuveiro", 1, "4", PowerUnit.KW);
  }
}
