package br.com.ampere.domain;

import java.time.LocalDate;

/** Window of the designer dashboard indicators, counted back from today. */
public enum DashboardPeriod {
  LAST_30_DAYS,
  LAST_90_DAYS,
  CURRENT_YEAR;

  /** First day inside the period; today counts as one of its days. */
  public LocalDate since(LocalDate today) {
    return switch (this) {
      case LAST_30_DAYS -> today.minusDays(29);
      case LAST_90_DAYS -> today.minusDays(89);
      case CURRENT_YEAR -> today.withDayOfYear(1);
    };
  }
}
