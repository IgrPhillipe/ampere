package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class ProjectDeadlineTest {

  private static final ZoneId ZONE = ZoneId.of("America/Recife");
  private static final LocalDate TODAY = LocalDate.of(2026, 10, 2);
  private static final OffsetDateTime NOON = TODAY.atTime(12, 0).atZone(ZONE).toOffsetDateTime();

  private static Project submitted(OffsetDateTime submittedAt) {
    Project project =
        new Project(
            "Projeto de teste",
            "Rua A, 1",
            "Recife",
            "2026-9999",
            ProjectStatus.DRAFT,
            new ResidentialMultifamily(
                6, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.of());
    project.submit(submittedAt);

    return project;
  }

  @Test
  void anApprovalExpiresThirtySixMonthsAfterTheLocalDayOfTheDecision() {
    Project project = submitted(NOON);

    // 01:00 UTC is still the previous day in Recife.
    project.approve(OffsetDateTime.parse("2026-10-03T01:00:00Z"));

    assertThat(project.approvalExpiresOn(ZONE)).isEqualTo(TODAY.plusMonths(36));
  }

  @Test
  void isOverdueWhenSubmittedMoreThanThirtyDaysAgo() {
    Project project = submitted(NOON.minusDays(40));

    assertThat(project.deadlineStatus(TODAY, ZONE)).isEqualTo(DeadlineStatus.OVERDUE);
    assertThat(project.reviewDeadline(ZONE)).isEqualTo(TODAY.minusDays(10));
  }

  @Test
  void isDueTodayWhenSubmittedExactlyThirtyDaysAgo() {
    Project project = submitted(NOON.minusDays(30));

    assertThat(project.deadlineStatus(TODAY, ZONE)).isEqualTo(DeadlineStatus.DUE_TODAY);
  }

  @Test
  void isDueTodayEvenWhenSubmittedLateInTheEveningThirtyDaysAgo() {
    OffsetDateTime lateEvening = TODAY.minusDays(30).atTime(23, 30).atZone(ZONE).toOffsetDateTime();

    assertThat(submitted(lateEvening).deadlineStatus(TODAY, ZONE))
        .isEqualTo(DeadlineStatus.DUE_TODAY);
  }

  @Test
  void isOnTimeWhenSubmittedLessThanThirtyDaysAgo() {
    Project project = submitted(NOON.minusDays(10));

    assertThat(project.deadlineStatus(TODAY, ZONE)).isEqualTo(DeadlineStatus.ON_TIME);
    assertThat(project.reviewDeadline(ZONE)).isEqualTo(TODAY.plusDays(20));
  }

  @Test
  void aReviewRecordsTheOutcomeAndItsDate() {
    Project project = submitted(NOON.minusDays(10));

    project.reject(NOON);

    assertThat(project.getStatus()).isEqualTo(ProjectStatus.REJECTED);
    assertThat(project.getReviewedAt()).isEqualTo(NOON);
  }

  @Test
  void aResubmissionResumesTheDeadlineWithTheDaysLeftAtTheRejection() {
    // Rejected on the 12th day, resubmitted 10 days later (US15, scenario 1).
    Project project = submitted(NOON.minusDays(22));
    project.reject(NOON.minusDays(10));

    project.submit(NOON);

    assertThat(project.remainingReviewDays(TODAY, ZONE)).isEqualTo(18);
    assertThat(project.reviewDeadline(ZONE)).isEqualTo(TODAY.plusDays(18));
    assertThat(project.elapsedReviewDays(TODAY, ZONE)).isEqualTo(12);
    assertThat(project.suspendedReviewDays(TODAY, ZONE)).isEqualTo(10);
    assertThat(project.getSuspendedReviewDays()).isEqualTo(10);
    assertThat(project.deadlineStatus(TODAY, ZONE)).isEqualTo(DeadlineStatus.ON_TIME);
    assertThat(project.isReviewSuspended()).isFalse();
  }

  @Test
  void theDeadlineStandsStillWhileTheProjectWaitsForTheFixes() {
    Project project = submitted(NOON.minusDays(22));
    project.reject(NOON.minusDays(10));

    assertThat(project.isReviewSuspended()).isTrue();
    assertThat(project.elapsedReviewDays(TODAY, ZONE)).isEqualTo(12);
    assertThat(project.remainingReviewDays(TODAY, ZONE)).isEqualTo(18);
    assertThat(project.suspendedReviewDays(TODAY, ZONE)).isEqualTo(10);
    assertThat(project.suspendedReviewDays(TODAY.plusDays(5), ZONE)).isEqualTo(15);
    assertThat(project.remainingReviewDays(TODAY.plusDays(5), ZONE)).isEqualTo(18);
  }

  @Test
  void theDaysUsedAndSuspendedAddUpAcrossRejections() {
    Project project = submitted(NOON.minusDays(40));
    project.reject(NOON.minusDays(35));
    project.submit(NOON.minusDays(30));
    project.reject(NOON.minusDays(20));

    project.submit(NOON.minusDays(12));

    assertThat(project.suspendedReviewDays(TODAY, ZONE)).isEqualTo(5 + 8);
    assertThat(project.elapsedReviewDays(TODAY, ZONE)).isEqualTo(5 + 10 + 12);
    assertThat(project.remainingReviewDays(TODAY, ZONE)).isEqualTo(3);
    assertThat(project.reviewDeadline(ZONE)).isEqualTo(TODAY.plusDays(3));
  }

  @Test
  void aReviewPastItsPeriodAtTheRejectionResumesOverdue() {
    Project project = submitted(NOON.minusDays(45));
    project.reject(NOON.minusDays(5));

    project.submit(NOON);

    assertThat(project.remainingReviewDays(TODAY, ZONE)).isEqualTo(-10);
    assertThat(project.deadlineStatus(TODAY, ZONE)).isEqualTo(DeadlineStatus.OVERDUE);
  }

  @Test
  void aSubmissionOfALegacyRowCountsFromTheSubmission() {
    Project project = submitted(NOON.minusDays(10));
    ReflectionTestUtils.setField(project, "reviewClockStartedAt", null);

    assertThat(project.reviewDeadline(ZONE)).isEqualTo(TODAY.plusDays(20));
    assertThat(project.elapsedReviewDays(TODAY, ZONE)).isEqualTo(10);
  }

  @Test
  void theDecisionStopsTheCountOfDaysUsed() {
    Project project = submitted(NOON.minusDays(10));
    project.approve(NOON.minusDays(4));

    assertThat(project.elapsedReviewDays(TODAY, ZONE)).isEqualTo(6);
    assertThat(project.suspendedReviewDays(TODAY, ZONE)).isZero();
    assertThat(project.isReviewSuspended()).isFalse();
  }

  @Test
  void anApprovalIsValidThroughItsLastDayAndExpiresTheDayAfter() {
    Project project = submitted(NOON.minusMonths(37));
    project.approve(NOON.minusMonths(36));

    assertThat(project.approvalExpiresOn(ZONE)).isEqualTo(TODAY);
    assertThat(project.isApprovalExpired(TODAY, ZONE)).isFalse();
    assertThat(project.isApprovalExpired(TODAY.plusDays(1), ZONE)).isTrue();

    project.expire();

    assertThat(project.getStatus()).isEqualTo(ProjectStatus.EXPIRED);
    assertThat(project.wasApproved()).isTrue();
    assertThat(project.getReviewedAt()).isEqualTo(NOON.minusMonths(36));
    assertThat(project.isApprovalExpired(TODAY.plusDays(1), ZONE)).isFalse();
  }

  @Test
  void onlyAnApprovedProjectExpires() {
    Project project = submitted(NOON.minusMonths(40));
    project.reject(NOON.minusMonths(37));

    assertThat(project.isApprovalExpired(TODAY, ZONE)).isFalse();
    assertThatThrownBy(project::expire).isInstanceOf(IllegalStateException.class);
  }

  @Test
  void rejectsDeadlineForAProjectThatWasNeverSubmitted() {
    Project draft =
        new Project(
            "Rascunho",
            "Rua B, 2",
            "Recife",
            "2026-9998",
            ProjectStatus.DRAFT,
            new ResidentialMultifamily(
                6, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
            List.of());

    assertThatThrownBy(() -> draft.reviewDeadline(ZONE)).isInstanceOf(IllegalStateException.class);
  }
}
