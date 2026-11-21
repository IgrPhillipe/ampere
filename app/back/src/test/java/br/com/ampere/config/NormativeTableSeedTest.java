package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableSet;
import br.com.ampere.domain.NormativeValue;
import br.com.ampere.domain.Standard;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class NormativeTableSeedTest {

  private static final NormativeTableSet TABLES =
      new NormativeTableSet(
          NormativeTableSeed.all(
              Map.of(
                  "DIS-NOR-053", new Standard("DIS-NOR-053", "REV 06"),
                  "DIS-NOR-030", new Standard("DIS-NOR-030", "REV 07"))));

  @ParameterizedTest
  @CsvSource({
    "1, 700, 1, 1, S ≤ 8",
    "8, 700, 1, 1, S ≤ 8",
    "8.01, 900, 3, 1, 8 < S ≤ 15",
    "20, 1600, 4, 2, 15 < S ≤ 20",
    "50, 2400, 6, 3, 30 < S ≤ 50",
    "180, 3000, 12, 3, 170 < S ≤ 200",
    "250, 3200, 14, 3, 220 < S ≤ 250"
  })
  void readsTabela5ByTheAreaBandClosedAbove(
      String area, String totalW, String general, String kitchen, String band) {
    NormativeValue row = TABLES.find(NormativeTableCode.T5_MINIMUM_OUTLETS, new BigDecimal(area));

    assertThat(row.value()).isEqualByComparingTo(totalW);
    assertThat(row.secondValue()).isEqualByComparingTo(general);
    assertThat(row.thirdValue()).isEqualByComparingTo(kitchen);
    assertThat(row.band()).isEqualTo(band);
    assertThat(row.reference().citation()).contains("Tabela 5");
  }

  @Test
  void leavesTabela5WithoutARowAbove250SquareMetres() {
    assertThat(TABLES.lookup(NormativeTableCode.T5_MINIMUM_OUTLETS, null, new BigDecimal("250.01")))
        .isEmpty();
  }
}
