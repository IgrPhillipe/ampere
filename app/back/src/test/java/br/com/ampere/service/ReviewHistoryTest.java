package br.com.ampere.service;

import static br.com.ampere.domain.ProjectEventType.APPROVED;
import static br.com.ampere.domain.ProjectEventType.REJECTED;
import static br.com.ampere.domain.ProjectEventType.RESUBMITTED;
import static br.com.ampere.domain.ProjectEventType.SUBMITTED;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.DashboardPeriod;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.service.ReviewDashboard.Deadlines;
import br.com.ampere.service.ReviewDashboard.Month;
import br.com.ampere.service.ReviewDashboard.Week;
import br.com.ampere.service.ReviewHistory.Event;
import br.com.ampere.service.ReviewHistory.RepeatedRejection;
import br.com.ampere.utils.Timestamps;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReviewHistoryTest {

  private static final LocalDate TODAY = LocalDate.of(2026, 11, 21);

  private static final LocalDate FIRST_DAY = DashboardPeriod.LAST_30_DAYS.since(TODAY);

  @Test
  void everyWeekThePeriodTouchesHasAnEntryFromItsMonday() {
    ReviewHistory history =
        history(
            event(1L, SUBMITTED, 1, LocalDate.of(2026, 10, 22)),
            event(2L, SUBMITTED, 1, LocalDate.of(2026, 10, 23)),
            event(2L, REJECTED, 1, LocalDate.of(2026, 11, 4)));

    assertThat(history.weekly())
        .containsExactly(
            new Week(LocalDate.of(2026, 10, 19), 1, 0),
            new Week(LocalDate.of(2026, 10, 26), 0, 0),
            new Week(LocalDate.of(2026, 11, 2), 0, 1),
            new Week(LocalDate.of(2026, 11, 9), 0, 0),
            new Week(LocalDate.of(2026, 11, 16), 0, 0));
  }

  @Test
  void theCurrentYearStartsOnTheMondayBeforeJanuaryFirst() {
    LocalDate firstDay = DashboardPeriod.CURRENT_YEAR.since(TODAY);
    ReviewHistory history = new ReviewHistory(List.of(), firstDay, TODAY);

    assertThat(history.weekly().getFirst().weekStart()).isEqualTo(LocalDate.of(2025, 12, 29));
    assertThat(history.weekly().getLast().weekStart()).isEqualTo(LocalDate.of(2026, 11, 16));
    assertThat(history.monthlyRejection()).hasSize(11);
  }

  @Test
  void theRejectionRateCountsOnlyTheDecisionsInsideThePeriod() {
    ReviewHistory history =
        history(
            event(1L, REJECTED, 1, LocalDate.of(2026, 10, 20)),
            event(2L, REJECTED, 1, LocalDate.of(2026, 11, 2)),
            event(3L, REJECTED, 1, LocalDate.of(2026, 11, 5)),
            event(4L, APPROVED, 1, LocalDate.of(2026, 11, 9)));

    assertThat(history.monthlyRejection())
        .containsExactly(
            new Month(YearMonth.of(2026, 10), null),
            new Month(YearMonth.of(2026, 11), new BigDecimal("66.7")));
  }

  @Test
  void aResubmissionResumesTheDeadlineWhereTheRejectionStoppedIt() {
    ReviewHistory history =
        history(
            // 35 days to the rejection, then 2 more: both decisions past the deadline.
            event(1L, SUBMITTED, 1, LocalDate.of(2026, 9, 20)),
            event(1L, REJECTED, 1, LocalDate.of(2026, 10, 25)),
            event(1L, RESUBMITTED, 2, LocalDate.of(2026, 11, 1)),
            event(1L, APPROVED, 2, LocalDate.of(2026, 11, 3)),
            // Decided on the 30th day: still on time.
            event(2L, SUBMITTED, 1, LocalDate.of(2026, 10, 21)),
            event(2L, APPROVED, 1, LocalDate.of(2026, 11, 20)),
            // 10 days before the period and 25 inside it.
            event(3L, SUBMITTED, 1, LocalDate.of(2026, 10, 1)),
            event(3L, REJECTED, 1, LocalDate.of(2026, 10, 11)),
            event(3L, RESUBMITTED, 2, LocalDate.of(2026, 10, 20)),
            event(3L, APPROVED, 2, LocalDate.of(2026, 11, 14)));

    assertThat(history.deadlines()).isEqualTo(new Deadlines(1, 3));
    assertThat(history.averageReviewDays()).isEqualByComparingTo("23.0");
    assertThat(history.averageCycleDays()).isEqualByComparingTo("39.3");
  }

  @Test
  void aDecisionWithoutItsSubmissionIsLeftOutOfTheTimesAndDeadlines() {
    ReviewHistory history = history(event(1L, APPROVED, 1, LocalDate.of(2026, 11, 10)));

    assertThat(history.decidedProjects(APPROVED)).isEqualTo(1);
    assertThat(history.averageReviewDays()).isNull();
    assertThat(history.averageCycleDays()).isNull();
    assertThat(history.deadlines()).isEqualTo(new Deadlines(0, 0));
  }

  @Test
  void aProjectReceivedTwiceCountsOnceWithItsLastVersion() {
    ReviewHistory history =
        history(
            event(1L, SUBMITTED, 1, LocalDate.of(2026, 10, 24)),
            event(1L, REJECTED, 1, LocalDate.of(2026, 10, 30)),
            event(1L, RESUBMITTED, 2, LocalDate.of(2026, 11, 5)),
            event(2L, SUBMITTED, 1, LocalDate.of(2026, 10, 1)));

    assertThat(history.received()).containsExactly(1L);
    assertThat(history.lastSubmittedVersions()).isEqualTo(Map.of(1L, 2));
    assertThat(history.weekly().stream().mapToLong(Week::received).sum()).isEqualTo(2);
  }

  @Test
  void repeatedRejectionsNeedTwoRejectionsAndTheLastInThePeriod() {
    ReviewHistory history =
        history(
            event(1L, REJECTED, 1, LocalDate.of(2026, 9, 1)),
            event(1L, REJECTED, 2, LocalDate.of(2026, 11, 1)),
            event(2L, REJECTED, 1, LocalDate.of(2026, 8, 1)),
            event(2L, REJECTED, 2, LocalDate.of(2026, 9, 1)),
            event(3L, REJECTED, 1, LocalDate.of(2026, 11, 2)));

    assertThat(history.repeatedRejections()).containsExactly(new RepeatedRejection(1L, 2));
  }

  private static ReviewHistory history(Event... events) {
    return new ReviewHistory(List.of(events), FIRST_DAY, TODAY);
  }

  private static Event event(Long projectId, ProjectEventType type, int version, LocalDate day) {
    return new Event(
        projectId, type, version, day.atTime(12, 0).atZone(Timestamps.ZONE).toOffsetDateTime());
  }
}
