package br.com.ampere.dto;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.UserRole;
import br.com.ampere.utils.Timestamps;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ProjectEventResponse(
    String id,
    ProjectEventType type,
    int version,
    String description,
    String detail,
    String authorName,
    UserRole authorRole,
    OffsetDateTime occurredAt,
    LocalDate reviewDeadline) {

  public static ProjectEventResponse from(ProjectEvent event) {
    LocalDate reviewDeadline =
        event.getType() == ProjectEventType.SUBMITTED
                || event.getType() == ProjectEventType.RESUBMITTED
            ? event
                .getOccurredAt()
                .atZoneSameInstant(Timestamps.ZONE)
                .toLocalDate()
                .plusDays(Project.REVIEW_PERIOD_DAYS)
            : null;

    return new ProjectEventResponse(
        String.valueOf(event.getId()),
        event.getType(),
        event.getVersion(),
        event.getDescription(),
        event.getDetail(),
        event.getAuthor() == null ? null : event.getAuthor().getName(),
        event.getAuthorRole(),
        event.getOccurredAt(),
        reviewDeadline);
  }
}
