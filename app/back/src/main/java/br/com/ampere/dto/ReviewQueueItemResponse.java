package br.com.ampere.dto;

import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.service.ReviewQueueEntry;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/** One row of the review queue, as the front end reads it. */
public record ReviewQueueItemResponse(
    String id,
    String name,
    String protocol,
    String municipality,
    OffsetDateTime submittedAt,
    LocalDate deadline,
    DeadlineStatus deadlineStatus,
    long daysRemaining,
    long warnings,
    @Schema(description = "Mensagens dos alertas da pré-validação do último cálculo")
        List<String> alerts,
    String ownerName,
    long consumerUnitsCount,
    BigDecimal demandKva,
    boolean reanalysis,
    @Schema(description = "Número do envio para análise, a partir de 1") int reviewCycle) {

  public static ReviewQueueItemResponse from(ReviewQueueEntry entry) {
    Project project = entry.project();

    return new ReviewQueueItemResponse(
        String.valueOf(project.getId()),
        project.getName(),
        project.getProtocol(),
        project.getMunicipality(),
        project.getSubmittedAt(),
        entry.deadline(),
        entry.deadlineStatus(),
        entry.daysRemaining(),
        entry.warnings().size(),
        entry.warnings(),
        project.getOwner() == null ? null : project.getOwner().getName(),
        entry.consumerUnitsCount(),
        entry.demandKva(),
        project.isReanalysis(),
        project.getReviewCycle());
  }
}
