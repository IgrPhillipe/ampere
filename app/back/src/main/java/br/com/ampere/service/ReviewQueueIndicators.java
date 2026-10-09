package br.com.ampere.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record ReviewQueueIndicators(
    long total, long dueSoon, long reviewedToday, long reviewedThisMonth, long rejectedThisMonth) {

  public BigDecimal monthlyRejectionPercent() {
    if (reviewedThisMonth == 0) {
      return BigDecimal.ZERO;
    }

    return BigDecimal.valueOf(rejectedThisMonth * 100)
        .divide(BigDecimal.valueOf(reviewedThisMonth), 1, RoundingMode.HALF_UP);
  }
}
