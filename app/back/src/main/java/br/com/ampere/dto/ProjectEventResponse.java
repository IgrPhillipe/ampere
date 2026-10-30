package br.com.ampere.dto;

import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.UserRole;
import java.time.OffsetDateTime;

public record ProjectEventResponse(
    Long id,
    ProjectEventType type,
    int version,
    String description,
    String detail,
    String authorName,
    UserRole authorRole,
    OffsetDateTime occurredAt) {

  public static ProjectEventResponse from(ProjectEvent event) {
    return new ProjectEventResponse(
        event.getId(),
        event.getType(),
        event.getVersion(),
        event.getDescription(),
        event.getDetail(),
        event.getAuthor() == null ? null : event.getAuthor().getName(),
        event.getAuthorRole(),
        event.getOccurredAt());
  }
}
