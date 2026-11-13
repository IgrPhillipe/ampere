package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.service.ReviewTimeline;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Project data required by the listing screen. */
public record ProjectResponse(
    String id,
    String name,
    String address,
    String municipality,
    BrazilianState state,
    String protocol,
    String ownerId,
    String ownerName,
    ProjectStatus status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    long pendingCount,
    long consumerUnitsCount,
    BigDecimal demandKva,
    @Schema(description = "Último dia do prazo de análise; nulo fora de análise")
        LocalDate reviewDeadline,
    @Schema(description = "Reprovado aguardando correção: o prazo não corre")
        boolean reviewSuspended,
    @Schema(description = "Último dia de validade da aprovação; nulo se nunca aprovado")
        LocalDate approvalValidUntil) {

  public static ProjectResponse from(
      Project project, long pendingCount, long consumerUnitsCount, BigDecimal demandKva) {
    ReviewTimeline timeline = ReviewTimeline.today(project);

    return new ProjectResponse(
        String.valueOf(project.getId()),
        project.getName(),
        project.getAddress(),
        project.getMunicipality(),
        project.getState(),
        project.getProtocol(),
        project.getOwner() == null ? null : String.valueOf(project.getOwner().getId()),
        project.getOwner() == null ? null : project.getOwner().getName(),
        project.getStatus(),
        project.getCreatedAt(),
        project.getUpdatedAt(),
        pendingCount,
        consumerUnitsCount,
        demandKva,
        timeline.reviewDeadline(),
        timeline.reviewSuspended(),
        timeline.approvalValidUntil());
  }
}
