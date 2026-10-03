package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;

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
