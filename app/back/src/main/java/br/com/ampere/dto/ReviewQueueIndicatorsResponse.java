package br.com.ampere.dto;

import br.com.ampere.service.ReviewQueueIndicators;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

public record ReviewQueueIndicatorsResponse(
    long total,
    long dueSoon,
    long reviewedToday,
    @Schema(description = "Reprovados sobre analisados no mês, de 0 a 100")
        BigDecimal monthlyRejectionPercent) {

  public static ReviewQueueIndicatorsResponse from(ReviewQueueIndicators indicators) {
    return new ReviewQueueIndicatorsResponse(
        indicators.total(),
        indicators.dueSoon(),
        indicators.reviewedToday(),
        indicators.monthlyRejectionPercent());
  }
}
