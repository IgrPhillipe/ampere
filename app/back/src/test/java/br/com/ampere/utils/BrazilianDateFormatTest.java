package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;

class BrazilianDateFormatTest {

  @Test
  void showsAnInstantInRecifeTime() {
    assertThat(BrazilianDateFormat.dateTime(OffsetDateTime.parse("2026-01-01T02:30:00.123456Z")))
        .isEqualTo("31/12/2025 23:30");
  }

  @Test
  void showsADayMonthAndYear() {
    assertThat(BrazilianDateFormat.date(LocalDate.of(2026, 3, 9))).isEqualTo("09/03/2026");
  }
}
