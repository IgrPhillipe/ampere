package br.com.ampere.service;

import static br.com.ampere.utils.Timestamps.ZONE;

import br.com.ampere.domain.Project;
import java.time.LocalDate;

/**
 * Where a project stands against the 30-day review period and the 36-month approval validity.
 *
 * @param reviewDeadline last day of the review while the project is under review; null otherwise,
 *     suspended included
 * @param elapsedReviewDays days of the period used, suspended ones excluded; null before the first
 *     submission
 * @param suspendedReviewDays days the period stood still waiting for fixes, the current wait
 *     included; null before the first submission
 * @param remainingReviewDays days left while under review or suspended, negative once overdue; null
 *     otherwise
 * @param reviewSuspended rejected and waiting for the designer: the period does not run
 * @param approvalValidUntil last valid day of the approval, also once expired; null if never
 *     approved
 */
public record ReviewTimeline(
    LocalDate reviewDeadline,
    Long elapsedReviewDays,
    Long suspendedReviewDays,
    Long remainingReviewDays,
    boolean reviewSuspended,
    LocalDate approvalValidUntil) {

  public static ReviewTimeline of(Project project, LocalDate today) {
    LocalDate validUntil =
        project.wasApproved() && project.getReviewedAt() != null
            ? project.approvalExpiresOn(ZONE)
            : null;
    if (!project.wasSubmitted()) {
      return new ReviewTimeline(null, null, null, null, false, validUntil);
    }
    boolean running = project.isUnderReview();
    boolean suspended = project.isReviewSuspended();

    return new ReviewTimeline(
        running ? project.reviewDeadline(ZONE) : null,
        project.elapsedReviewDays(today, ZONE),
        project.suspendedReviewDays(today, ZONE),
        running || suspended ? project.remainingReviewDays(today, ZONE) : null,
        suspended,
        validUntil);
  }

  public static ReviewTimeline today(Project project) {
    return of(project, LocalDate.now(ZONE));
  }
}
