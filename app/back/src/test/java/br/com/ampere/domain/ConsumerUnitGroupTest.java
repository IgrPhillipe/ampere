package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class ConsumerUnitGroupTest {

  private static final Project PROJECT =
      Project.draft(
          "Residencial Mirante",
          "Rua da Aurora, 120",
          "Recife",
          "2026-0001",
          new ResidentialMultifamily(
              12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
          List.of());

  @Test
  void eachKindBuildsItsOwnSubclass() {
    assertThat(GroupKind.RESIDENTIAL.create(PROJECT, apartments(68, 6.5)))
        .isInstanceOf(ResidentialGroup.class);
    assertThat(GroupKind.LOAD.create(PROJECT, commonArea(List.of()))).isInstanceOf(LoadGroup.class);
    assertThat(GroupKind.EV_CHARGING.create(PROJECT, charging(7.4, false, true)))
        .isInstanceOf(EvChargingGroup.class);
  }

  @Test
  void aCompleteApartmentGroupIsValidated() {
    ConsumerUnitGroup group = GroupKind.RESIDENTIAL.create(PROJECT, apartments(68, 6.5));

    assertThat(group.validate()).isEmpty();
    assertThat(group.status()).isEqualTo(GroupStatus.VALIDATED);
    assertThat(group.summary()).isEqualTo("68 m² · 2 quartos · DIS-NOR-053 Quadro 35");
    assertThat(group.declaredLoadKw()).isEqualByComparingTo("156");
  }

  @Test
  void anApartmentGroupWithoutUsefulAreaOrLoadIsMissingData() {
    ConsumerUnitGroup group =
        GroupKind.RESIDENTIAL.create(
            PROJECT,
            new GroupSpec(
                "Apartamento tipo A",
                24,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null));

    assertThat(group.validate())
        .extracting(ValidationIssue::severity, ValidationIssue::field)
        .containsExactly(
            tuple(IssueSeverity.MISSING_DATA, "usefulArea"),
            tuple(IssueSeverity.MISSING_DATA, "unitLoadKw"));
    assertThat(group.status()).isEqualTo(GroupStatus.MISSING_DATA);
    assertThat(group.declaredLoadKw()).isEqualByComparingTo("0");
    assertThat(group.summary()).isEqualTo("Área útil não informada · DIS-NOR-053 Quadro 35");
  }

  @Test
  void anAreaBeyondQuadro35AsksForReview() {
    ConsumerUnitGroup group = GroupKind.RESIDENTIAL.create(PROJECT, apartments(1200, 20));

    assertThat(group.validate())
        .extracting(ValidationIssue::severity, ValidationIssue::field)
        .containsExactly(tuple(IssueSeverity.REVIEW, "usefulArea"));
    assertThat(group.status()).isEqualTo(GroupStatus.REVIEW);
  }

  @Test
  void aLargeMotorWithoutStartingConditionAsksForReview() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT,
            commonArea(
                List.of(
                    motor("Elevador", 12, PowerUnit.CV, null),
                    lighting("Iluminação da garagem", 3, LampTechnology.COMPACT_FLUORESCENT_LED))));

    assertThat(group.validate())
        .extracting(ValidationIssue::severity, ValidationIssue::field)
        .containsExactly(tuple(IssueSeverity.REVIEW, "items[0].simultaneousStart"));
    assertThat(group.validate().getFirst().message())
        .startsWith("Elevador declarado com 12 CV. Motores acima de 5 CV");
    assertThat(group.status()).isEqualTo(GroupStatus.REVIEW);
  }

  @Test
  void aMotorUpToFiveCvNeedsNoStartingCondition() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT, commonArea(List.of(motor("Portão", 3.6, PowerUnit.KW, null))));

    assertThat(group.status()).isEqualTo(GroupStatus.VALIDATED);
  }

  @Test
  void answeringTheStartingConditionValidatesTheMotor() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT, commonArea(List.of(motor("Elevador", 12, PowerUnit.CV, false))));

    assertThat(group.status()).isEqualTo(GroupStatus.VALIDATED);
  }

  @Test
  void commercialLightingNeedsTheLampTechnology() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT, loads(LoadUsage.COMMERCIAL, List.of(lighting("Loja térrea", 4, null))));

    assertThat(group.validate())
        .extracting(ValidationIssue::severity, ValidationIssue::field)
        .containsExactly(tuple(IssueSeverity.MISSING_DATA, "items[0].lampTechnology"));
  }

  @Test
  void commonAreaLightingAlsoSaysWhetherItIsLightingOrOutlets() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT, commonArea(List.of(lighting("Iluminação da garagem", 3, null))));

    assertThat(group.validate())
        .extracting(ValidationIssue::severity, ValidationIssue::field)
        .containsExactly(tuple(IssueSeverity.MISSING_DATA, "items[0].lampTechnology"));
  }

  @Test
  void outletsAreDeclaredAsSuch() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT, commonArea(List.of(lighting("Tomadas", 2, LampTechnology.GENERAL_OUTLETS))));

    assertThat(group.status()).isEqualTo(GroupStatus.VALIDATED);
  }

  @Test
  void aLoadGroupWithoutLoadsIsMissingData() {
    ConsumerUnitGroup group = GroupKind.LOAD.create(PROJECT, commonArea(List.of()));

    assertThat(group.validate()).extracting(ValidationIssue::field).containsExactly("items");
    assertThat(group.loadPerUnitKw()).isNull();
    assertThat(group.summary()).isEqualTo("Nenhuma carga informada · DIS-NOR-030 item 6.27");
  }

  @Test
  void aLoadWithoutPowerIsMissingDataBeforeAnyParcelRule() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT, commonArea(List.of(motor("Bomba de recalque", null, PowerUnit.CV, null))));

    assertThat(group.validate())
        .extracting(ValidationIssue::severity, ValidationIssue::field)
        .containsExactly(tuple(IssueSeverity.MISSING_DATA, "items[0].power"));
  }

  @Test
  void theLoadOfALoadGroupSumsItsItemsInKilowatts() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT,
            commonArea(
                List.of(
                    motor("Elevador", 10, PowerUnit.CV, false), lighting("Iluminação", 2, null))));

    assertThat(group.loadPerUnitKw()).isEqualByComparingTo("9.355");
    assertThat(group.summary()).isEqualTo("Elevador, Iluminação · DIS-NOR-030 item 6.27");
  }

  @Test
  void theSummaryOfALoadGroupStopsAfterThreeLoads() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT,
            commonArea(
                List.of(
                    lighting("A", 1, null),
                    lighting("B", 1, null),
                    lighting("C", 1, null),
                    lighting("D", 1, null))));

    assertThat(group.summary()).isEqualTo("A, B, C e mais 1 · DIS-NOR-030 item 6.27");
  }

  @Test
  void chargingWithoutLoadManagementIsMissingData() {
    ConsumerUnitGroup group = GroupKind.EV_CHARGING.create(PROJECT, charging(7.4, false, null));

    assertThat(group.validate())
        .extracting(ValidationIssue::severity, ValidationIssue::field)
        .containsExactly(tuple(IssueSeverity.MISSING_DATA, "loadManagement"));
    assertThat(group.summary()).isEqualTo("6 pontos de 7,4 kW · DIS-NOR-053 Quadro 33");
    assertThat(group.declaredLoadKw()).isEqualByComparingTo("44.4");
  }

  @Test
  void aFixedStationWithoutPowerIsMissingData() {
    ConsumerUnitGroup group = GroupKind.EV_CHARGING.create(PROJECT, charging(null, false, true));

    assertThat(group.validate())
        .extracting(ValidationIssue::field)
        .containsExactly("powerPerPointKw");
    assertThat(group.summary())
        .isEqualTo("6 pontos, potência não informada · DIS-NOR-053 Quadro 33");
  }

  @Test
  void anIncorporatedStationWithoutPowerTakesTheStandardValue() {
    ConsumerUnitGroup group = GroupKind.EV_CHARGING.create(PROJECT, charging(null, true, true));

    assertThat(group.status()).isEqualTo(GroupStatus.VALIDATED);
    assertThat(group.loadPerUnitKw()).isEqualByComparingTo("3.3");
  }

  @Test
  void missingDataOutweighsReview() {
    ConsumerUnitGroup group =
        GroupKind.LOAD.create(
            PROJECT,
            loads(
                LoadUsage.COMMERCIAL,
                List.of(motor("Elevador", 12, PowerUnit.CV, null), lighting("Loja", 4, null))));

    assertThat(group.status()).isEqualTo(GroupStatus.MISSING_DATA);
  }

  @Test
  void updatingReplacesWhatWasDeclared() {
    ConsumerUnitGroup group = GroupKind.EV_CHARGING.create(PROJECT, charging(7.4, false, null));

    group.update(charging(7.4, false, true));

    assertThat(group.status()).isEqualTo(GroupStatus.VALIDATED);
  }

  @Test
  void requiresANameAndAQuantity() {
    GroupSpec withoutName =
        new GroupSpec(null, 1, null, null, null, null, null, null, null, null, null, null);

    assertThatThrownBy(() -> GroupKind.RESIDENTIAL.create(PROJECT, withoutName))
        .isInstanceOf(NullPointerException.class)
        .hasMessage("name");
  }

  private static GroupSpec apartments(double usefulArea, double unitLoadKw) {
    return new GroupSpec(
        "Apartamento tipo A",
        24,
        BigDecimal.valueOf(usefulArea),
        2,
        BigDecimal.valueOf(unitLoadKw),
        false,
        null,
        null,
        null,
        null,
        null,
        null);
  }

  private static GroupSpec commonArea(List<LoadItem> items) {
    return loads(LoadUsage.COMMON_AREA, items);
  }

  private static GroupSpec loads(LoadUsage usage, List<LoadItem> items) {
    return new GroupSpec(
        "Área comum", 1, null, null, null, null, usage, items, null, null, null, null);
  }

  private static GroupSpec charging(Double power, Boolean incorporated, Boolean loadManagement) {
    return new GroupSpec(
        "Recarga de veículo elétrico",
        6,
        null,
        null,
        null,
        null,
        null,
        null,
        power == null ? null : BigDecimal.valueOf(power),
        incorporated,
        loadManagement,
        EvStationType.COLLECTIVE);
  }

  private static LoadItem motor(
      String description, Number power, PowerUnit unit, Boolean simultaneousStart) {
    return new LoadItem(
        LoadCategory.MOTORS,
        description,
        1,
        power == null ? null : new BigDecimal(power.toString()),
        unit,
        null,
        simultaneousStart);
  }

  private static LoadItem lighting(String description, double kw, LampTechnology lamp) {
    return new LoadItem(
        LoadCategory.LIGHTING_AND_OUTLETS,
        description,
        1,
        BigDecimal.valueOf(kw),
        PowerUnit.KW,
        lamp,
        null);
  }
}
