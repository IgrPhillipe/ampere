package br.com.ampere.dto;

import br.com.ampere.service.ReviewQueueIndicators;

/** Numbers shown above the review queue. */
public record ReviewQueueIndicatorsResponse(
    long total, long dueSoon, long reviewedToday, double monthlyRejectionRate) {

  public static ReviewQueueIndicatorsResponse from(ReviewQueueIndicators indicators) {
    return new ReviewQueueIndicatorsResponse(
        indicators.total(),
        indicators.dueSoon(),
        indicators.reviewedToday(),
        indicators.monthlyRejectionRate());
  }
}
