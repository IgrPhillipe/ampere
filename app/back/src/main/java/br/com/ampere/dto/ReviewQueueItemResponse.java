package br.com.ampere.dto;

import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.service.ReviewQueueEntry;
import java.time.LocalDate;
import java.time.OffsetDateTime;

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
    long warnings) {

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
        entry.warnings());
  }
}
