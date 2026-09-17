package br.com.ampere.dto;

import br.com.ampere.domain.ProjectStatus;
import java.util.Map;

/** Global project totals displayed in the status filter bar. */
public record ProjectStatusCounts(
    long total,
    long draft,
    long awaitingSubmission,
    long underReview,
    long rejected,
    long approved) {

  public static ProjectStatusCounts from(Map<ProjectStatus, Long> counts) {
    long draft = counts.getOrDefault(ProjectStatus.DRAFT, 0L);
    long awaitingSubmission = counts.getOrDefault(ProjectStatus.AWAITING_SUBMISSION, 0L);
    long underReview = counts.getOrDefault(ProjectStatus.UNDER_REVIEW, 0L);
    long rejected = counts.getOrDefault(ProjectStatus.REJECTED, 0L);
    long approved = counts.getOrDefault(ProjectStatus.APPROVED, 0L);
    long total = draft + awaitingSubmission + underReview + rejected + approved;

    return new ProjectStatusCounts(
        total, draft, awaitingSubmission, underReview, rejected, approved);
  }
}
