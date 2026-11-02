package br.com.ampere.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** The designer's results in the period, read from the project history. */
public record DesignerIndicators(
    long submitted,
    long firstDecisions,
    long firstReviewApprovals,
    BigDecimal averageDaysToApproval,
    BigDecimal approvedDemand) {

  /** Null when no project had its first decision in the period. */
  public BigDecimal firstReviewApprovalPercent() {
    if (firstDecisions == 0) {
      return null;
    }

    return BigDecimal.valueOf(firstReviewApprovals * 100)
        .divide(BigDecimal.valueOf(firstDecisions), 1, RoundingMode.HALF_UP);
  }
}
