package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class BrazilianNumberFormatTest {

  @Test
  void usesCommaForDecimalsAndDotForThousands() {
    assertThat(BrazilianNumberFormat.format(new BigDecimal("1234567.5"))).isEqualTo("1.234.567,50");
  }

  @Test
  void roundsHalfUp() {
    assertThat(BrazilianNumberFormat.format(new BigDecimal("0.125"))).isEqualTo("0,13");
  }

  @Test
  void keepsTheSignOfOverdueDays() {
    assertThat(BrazilianNumberFormat.format(-10)).isEqualTo("-10");
  }

  @Test
  void groupsWholeNumbers() {
    assertThat(BrazilianNumberFormat.format(1500)).isEqualTo("1.500");
  }
}
