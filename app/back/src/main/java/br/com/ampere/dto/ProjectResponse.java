package br.com.ampere.dto;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import java.time.OffsetDateTime;

/** Project data required by the listing screen. */
public record ProjectResponse(
    String id,
    String name,
    String address,
    String municipality,
    String protocol,
    ProjectStatus status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    long pendingCount) {

  public static ProjectResponse from(Project project, long pendingCount) {
    return new ProjectResponse(
        String.valueOf(project.getId()),
        project.getName(),
        project.getAddress(),
        project.getMunicipality(),
        project.getProtocol(),
        project.getStatus(),
        project.getCreatedAt(),
        project.getUpdatedAt(),
        pendingCount);
  }
}
