package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class NormativeTableTest {

  private static final Standard STANDARD = new Standard("DIS-NOR-053", "REV 06");

  private static NormativeTableRow band(String lower, String upper, String value) {
    return new NormativeTableRow(
        null,
        lower == null ? null : new BigDecimal(lower),
        upper == null ? null : new BigDecimal(upper),
        new BigDecimal(value),
        null,
        null,
        null);
  }

  private static NormativeTable quadro37(List<NormativeTableRow> rows) {
    return new NormativeTable(
        STANDARD,
        NormativeTableCode.Q37_SAFETY_FACTOR,
        "Quadro 37",
        "Anexo I, item 5",
        "108",
        rows,
        "admin@ampere.local");
  }

  private static final NormativeTable QUADRO_37 =
      quadro37(
          List.of(
              band(null, "25", "1.5"),
              band("25", "50", "1.3"),
              band("50", "100", "1.2"),
              band("100", null, "1.1")));

  @Test
  void findsTheFirstBandThatReachesTheArgument() {
    assertThat(QUADRO_37.find(null, new BigDecimal("25")))
        .get()
        .extracting(NormativeTableRow::getPrimaryValue)
        .isEqualTo(new BigDecimal("1.5"));
    assertThat(QUADRO_37.find(null, new BigDecimal("25.01")))
        .get()
        .extracting(NormativeTableRow::getPrimaryValue)
        .isEqualTo(new BigDecimal("1.3"));
    assertThat(QUADRO_37.find(null, new BigDecimal("5000")))
        .get()
        .extracting(NormativeTableRow::getPrimaryValue)
        .isEqualTo(new BigDecimal("1.1"));
  }

  @Test
  void aValueBetweenTwoPrintedBandsFallsInTheNextOne() {
    NormativeTable quadro35 =
        new NormativeTable(
            STANDARD,
            NormativeTableCode.Q35_APARTMENT_DEMAND,
            "Quadro 35",
            "Anexo I, item 1",
            "107",
            List.of(band(null, "40", "1.00"), band("41", "45", "1.05")),
            "admin@ampere.local");

    assertThat(quadro35.find(null, new BigDecimal("40.5")))
        .get()
        .extracting(NormativeTableRow::getPrimaryValue)
        .isEqualTo(new BigDecimal("1.05"));
    assertThat(quadro35.find(null, new BigDecimal("46"))).isEmpty();
  }

  @Test
  void acceptsTheBandsAsPrinted() {
    assertThat(QUADRO_37.problems()).isEmpty();
  }

  @Test
  void refusesBandsOutOfOrderOrOpenBeforeTheEnd() {
    NormativeTable table =
        quadro37(
            List.of(
                band("50", "100", "1.2"),
                band(null, "25", "1.5"),
                band("100", null, "1.1"),
                band("200", "300", "1.0")));

    assertThat(table.problems())
        .containsExactly(
            "Linha 2: as faixas precisam estar em ordem crescente.",
            "Linha 4: só a última faixa pode ficar sem limite superior.");
  }

  @Test
  void aKeyedTableNeedsOneOfItsKeysOnEveryRow() {
    NormativeTable tabela14 =
        new NormativeTable(
            new Standard("DIS-NOR-030", "REV 07"),
            NormativeTableCode.T14_MOTORS,
            "Tabela 14",
            "6.27.7",
            "68",
            List.of(
                new NormativeTableRow("LARGEST", null, null, BigDecimal.ONE, null, null, null),
                new NormativeTableRow("SMALLEST", null, null, BigDecimal.ONE, null, null, null)),
            "admin@ampere.local");

    assertThat(tabela14.problems())
        .containsExactly("Linha 2: escolha uma das chaves de Tabela 14.");
  }

  @Test
  void theServiceEntranceTablesNeedAllThreeValues() {
    NormativeTable tabela2 =
        new NormativeTable(
            STANDARD,
            NormativeTableCode.T2_SERVICE_ENTRANCE_380_220,
            "Tabela 2",
            "Anexo I, item 8.2",
            "123",
            List.of(band("0", "46", "1")),
            "admin@ampere.local");

    assertThat(tabela2.problems())
        .containsExactly(
            "Linha 1: informe seção do condutor (mm²).", "Linha 1: informe disjuntor geral (a).");
  }

  @Test
  void onlyADraftIsRevisedOrPublished() {
    NormativeTable table = quadro37(List.of(band(null, "25", "1.5")));
    table.publish("revisor@ampere.local");

    assertThat(table.getStatus()).isEqualTo(NormativeTableStatus.PUBLISHED);
    assertThat(table.getVerifiedBy()).isEqualTo("revisor@ampere.local");
    assertThatThrownBy(() -> table.revise("Quadro 37", "item 5", "108", List.of()))
        .isInstanceOf(IllegalStateException.class);
    assertThatThrownBy(() -> table.publish("revisor@ampere.local"))
        .isInstanceOf(IllegalStateException.class);
  }

  @Test
  void whoTypedATableDoesNotVerifyIt() {
    assertThat(QUADRO_37.isVerifiableBy("ADMIN@ampere.local")).isFalse();
    assertThat(QUADRO_37.isVerifiableBy("revisor@ampere.local")).isTrue();
  }

  @Test
  void quadro36IsReadAsAPercentage() {
    NormativeValue value =
        new NormativeTableSet(List.of(publishedQuadro36(List.of(band("20", "20", "87.20")))))
            .find(NormativeTableCode.Q36_COINCIDENCE_FACTOR, new BigDecimal("20"));

    assertThat(value.factor()).isEqualByComparingTo("0.8720");
  }

  private static NormativeTable publishedQuadro36(List<NormativeTableRow> rows) {
    NormativeTable table =
        new NormativeTable(
            STANDARD,
            NormativeTableCode.Q36_COINCIDENCE_FACTOR,
            "Quadro 36",
            "Anexo I, item 3",
            "107",
            rows,
            "admin@ampere.local");
    table.publish("revisor@ampere.local");
    return table;
  }
}
