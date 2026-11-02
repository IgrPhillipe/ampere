package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class DashboardPeriodTest {

  private static final LocalDate TODAY = LocalDate.of(2026, 3, 15);

  @Test
  void countsTodayAsTheLastDayOfTheWindow() {
    assertThat(DashboardPeriod.LAST_30_DAYS.since(TODAY)).isEqualTo(LocalDate.of(2026, 2, 14));
    assertThat(DashboardPeriod.LAST_90_DAYS.since(TODAY)).isEqualTo(LocalDate.of(2025, 12, 16));
  }

  @Test
  void theCurrentYearStartsOnTheFirstOfJanuary() {
    assertThat(DashboardPeriod.CURRENT_YEAR.since(TODAY)).isEqualTo(LocalDate.of(2026, 1, 1));
    assertThat(DashboardPeriod.CURRENT_YEAR.since(LocalDate.of(2026, 1, 1)))
        .isEqualTo(LocalDate.of(2026, 1, 1));
  }
}
