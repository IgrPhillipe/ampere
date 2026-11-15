package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class NormativeTableComparisonTest {

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

  private static NormativeTableRow keyed(String key, String value) {
    return new NormativeTableRow(key, null, null, new BigDecimal(value), null, null, null);
  }

  private static NormativeTable table(NormativeTableCode code, NormativeTableRow... rows) {
    return new NormativeTable(
        STANDARD, code, "Tabela", "Anexo I", "1", List.of(rows), "admin@ampere.com");
  }

  private static NormativeTable quadro37(NormativeTableRow... rows) {
    return table(NormativeTableCode.Q37_SAFETY_FACTOR, rows);
  }

  @Test
  void pairsTheRowsByBandAndReportsTheChangedValue() {
    NormativeTable before =
        quadro37(band(null, "25", "1.5"), band("25", "50", "1.3"), band("50", null, "1.2"));
    NormativeTable after =
        quadro37(band(null, "25", "1.4"), band("25", "50", "1.3"), band("50", null, "1.2"));

    NormativeTableComparison comparison = NormativeTableComparison.between(before, after);

    assertThat(comparison.included()).isEmpty();
    assertThat(comparison.removed()).isEmpty();
    assertThat(comparison.changed())
        .singleElement()
        .satisfies(
            change -> {
              assertThat(change.before().getPrimaryValue()).isEqualByComparingTo("1.5");
              assertThat(change.after().getPrimaryValue()).isEqualByComparingTo("1.4");
            });
  }

  @Test
  void aMovedBandIsOneRowRemovedAndOneIncluded() {
    NormativeTable before = quadro37(band(null, "25", "1.5"), band("25", null, "1.3"));
    NormativeTable after =
        quadro37(band(null, "25", "1.5"), band("25", "60", "1.3"), band("60", null, "1.1"));

    NormativeTableComparison comparison = NormativeTableComparison.between(before, after);

    assertThat(comparison.removed())
        .singleElement()
        .satisfies(row -> assertThat(row.getUpperBound()).isNull());
    assertThat(comparison.included())
        .extracting(NormativeTableRow::getLowerBound)
        .containsExactly(new BigDecimal("25"), new BigDecimal("60"));
    assertThat(comparison.changed()).isEmpty();
  }

  @Test
  void pairsKeyedRowsByTheKey() {
    NormativeTableCode code = NormativeTableCode.T22_GENERAL_LIGHTING_OUTLETS;
    String[] keys = code.keys().stream().map(NormativeTableKey::code).toArray(String[]::new);
    NormativeTable before = table(code, keyed(keys[0], "1"), keyed(keys[1], "2"));
    NormativeTable after = table(code, keyed(keys[1], "3"), keyed(keys[2], "4"));

    NormativeTableComparison comparison = NormativeTableComparison.between(before, after);

    assertThat(comparison.removed())
        .extracting(NormativeTableRow::getRowKey)
        .containsExactly(keys[0]);
    assertThat(comparison.included())
        .extracting(NormativeTableRow::getRowKey)
        .containsExactly(keys[2]);
    assertThat(comparison.changed())
        .extracting(change -> change.after().getRowKey())
        .containsExactly(keys[1]);
  }

  @Test
  void theSamePrintedValueWithAnotherScaleIsNoChange() {
    NormativeTable before = quadro37(band(null, "25", "1.5"));
    NormativeTable after = quadro37(band(null, "25.00", "1.5000"));

    assertThat(NormativeTableComparison.between(before, after).isEmpty()).isTrue();
  }

  @Test
  void aChangedLabelIsAChangedRow() {
    NormativeTable before = quadro37(band(null, "25", "1.5"));
    NormativeTable after =
        quadro37(
            new NormativeTableRow(
                null, null, new BigDecimal("25"), new BigDecimal("1.5"), null, null, "até 25 kVA"));

    assertThat(NormativeTableComparison.between(before, after).changed()).hasSize(1);
  }

  @Test
  void refusesRevisionsOfAnotherTable() {
    NormativeTable quadro37 = quadro37(band(null, "25", "1.5"));
    NormativeTable other =
        table(
            NormativeTableCode.T22_GENERAL_LIGHTING_OUTLETS,
            keyed(NormativeTableCode.T22_GENERAL_LIGHTING_OUTLETS.keys().get(0).code(), "1"));

    assertThatThrownBy(() -> NormativeTableComparison.between(quadro37, other))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
