package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;
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
    BrazilianState state,
    OffsetDateTime submittedAt,
    @Schema(description = "Último dia do prazo de 30 dias, já somados os dias suspensos")
        LocalDate deadline,
    DeadlineStatus deadlineStatus,
    @Schema(description = "Dias restantes do prazo; negativo quando atrasado") long daysRemaining,
    @Schema(description = "Dias corridos de análise, sem os dias suspensos") long elapsedDays,
    @Schema(description = "Dias em que o prazo ficou suspenso aguardando correção")
        long suspendedDays,
    long warnings,
    @Schema(description = "Mensagens dos alertas da pré-validação do último cálculo")
        List<String> alerts,
    String ownerName,
    long consumerUnitsCount,
    BigDecimal demandKva,
    boolean reanalysis,
    @Schema(description = "Número do envio para análise, a partir de 1") int reviewCycle,
    String reviewerId,
    String reviewerName) {

  public static ReviewQueueItemResponse from(ReviewQueueEntry entry) {
    Project project = entry.project();
    User reviewer = project.getReviewer();

    return new ReviewQueueItemResponse(
        String.valueOf(project.getId()),
        project.getName(),
        project.getProtocol(),
        project.getMunicipality(),
        project.getState(),
        project.getSubmittedAt(),
        entry.deadline(),
        entry.deadlineStatus(),
        entry.daysRemaining(),
        entry.elapsedDays(),
        entry.suspendedDays(),
        entry.warnings().size(),
        entry.warnings(),
        project.getOwner() == null ? null : project.getOwner().getName(),
        entry.consumerUnitsCount(),
        entry.demandKva(),
        project.isReanalysis(),
        project.getReviewCycle(),
        reviewer == null ? null : String.valueOf(reviewer.getId()),
        reviewer == null ? null : reviewer.getName());
  }
}
