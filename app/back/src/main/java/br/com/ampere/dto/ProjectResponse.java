package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import java.math.BigDecimal;
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
    BigDecimal demandKva) {

  public static ProjectResponse from(
      Project project, long pendingCount, long consumerUnitsCount, BigDecimal demandKva) {
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
        demandKva);
  }
}
