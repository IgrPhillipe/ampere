package br.com.ampere.dto;

import br.com.ampere.service.ReviewQueueIndicators;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

public record ReviewQueueIndicatorsResponse(
    long total,
    long dueSoon,
    long highDemand,
    long reanalysis,
    long reviewedToday,
    @Schema(description = "Reprovados sobre analisados no mês, de 0 a 100")
        BigDecimal monthlyRejectionPercent,
    @Schema(description = "Projetos aprovados, inclusive com a aprovação vencida") long approved,
    @Schema(description = "Projetos reprovados, aguardando o reenvio") long rejected) {

  public static ReviewQueueIndicatorsResponse from(ReviewQueueIndicators indicators) {
    return new ReviewQueueIndicatorsResponse(
        indicators.total(),
        indicators.dueSoon(),
        indicators.highDemand(),
        indicators.reanalysis(),
        indicators.reviewedToday(),
        indicators.monthlyRejectionPercent(),
        indicators.approved(),
        indicators.rejected());
  }
}
